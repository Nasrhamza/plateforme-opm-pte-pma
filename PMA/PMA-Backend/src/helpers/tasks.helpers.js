const Task = require("../models/task");
const Project = require("../models/project");
const { createAndSendNotification } = require("../controllers/notification.controller")

async function findTasks(filter, multiple){ 
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.Status) query.Status = filter.Status;
    if(filter.Project) query.Project = filter.Project;
    if(filter.Title) query.Title = { $regex : filter.Title, $options : 'i' };
    //suppose roles are separated by a dash -
    if(filter.Executor) query.Executor = { $in : filter.Executor.split('-') };
    if (filter.TeamLeader) query.TeamLeader = filter.TeamLeader;
    if (filter.Status) query.Status = filter.Status;
    if (filter.ref) query.ref = filter.ref;
    if (filter.start && filter.end) {
        query.StartDate = { $gte : filter.start, $lt: filter.end }
        query.Deadline = { $lte : filter.end }
    }
    try {
        const request = multiple ? 
        Task.find(query): 
        Task.findOne(query);
        const tasks = await request
        .populate({
            path : 'Project',
            populate : [
                { 
                    path : 'TeamLeader',
                    select : '-password -isEnabled'
                },
                { 
                    path : 'equipe',
                    select : '-password -isEnabled'
                },
                { 
                    path : 'client',
                    select : '-password -isEnabled'
                }
            ]
        })
        .populate({
            path : 'Executor',
            select : '-password -isEnabled'
        })
        .populate({
            path : 'companions',
            select : '-password -isEnabled'
        })
        .sort({
            createdAt : -1
        })
        const total = await Task.countDocuments(query);
        return { tasks, total};
    } catch (error) {
        throw Error("Error white getting tasks")
    }
}
async function generateRef() {
    let newRef = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    const existRef = await Task.find({ ref: newRef });

    if (existRef.length > 0) {
        return await generateRef();
    }

    return newRef;
}

async function updateProjectProgress(projectId){
    const projectTasksAll = await Task.find({ Project : projectId });
    const project = await Project.findById(projectId);
    const projectTasksCompleted = await Task.find({ Project : projectId, Status : "Closed" });
    const percentage = projectTasksAll.length === 0 ? 0 : Math.round((projectTasksCompleted.length/projectTasksAll.length)*100);
    if(project.status === "On Hold") return; // si le projet est on hold, ne faire rien
    if(percentage >= 100){
        const closingDate = new Date();
        closingDate.setHours(0, 0, 0, 0);
        await Project.findByIdAndUpdate({_id : projectId}, { $set: { progress : 100, status : "Completed", closedAt : closingDate } }, { new : true });
    }else{
        await Project.findByIdAndUpdate({_id : projectId}, { $set: { progress : percentage, status : "In Progress", closedAt : null } }, { new : true });
    };
    const updatedProject = await Project.findById(project._id.toString());
    //notify uses to reate the team leader if the project has been completed
    if(updatedProject.status === 'Completed'){

        const teamLeaderId = updatedProject.TeamLeader.toString();
        let membersToNotify = updatedProject.equipe.map(id => id.toString());
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        };
        membersToNotify.push(teamLeaderId);

        await createAndSendNotification(
            `Project completed`, 
            `Project : ${updatedProject.Projectname} have been completed. Don't forget to evaluate your team leader in the project settings`, 
            membersToNotify,
            updatedProject._id.toString(),
            'Project',
            teamLeaderId
        );
    }
}

async function validateTask(data){
    try {
        if(!data.Executor) throw Error("Executors are required");
        if(data.Executor.length == 0) throw Error("At least 1 executor should be specified");
        if(!data.Project) throw Error("Project must be provided");
        if(!data.Priority) throw Error("Priority is required");
        if(!data.StartDate) throw Error("StartDate is required");
        if(!data.Deadline) throw Error("Deadline is required");
        if(!data.Title) throw Error("Title is required");
        return true;
    } catch (error) {
        return false
    }
}


module.exports = {
    findTasks,
    updateProjectProgress,
    validateTask,
    generateRef
}
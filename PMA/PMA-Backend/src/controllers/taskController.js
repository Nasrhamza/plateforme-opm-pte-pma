const Task = require("../models/task");
const Project = require("../models/project");
const { updateUserNoteInProject } = require("../helpers/rating.helpers");
const { generateRef } = require("../helpers/tasks.helpers");
const ApiError = require("../config/api-error.model")
const { 
    validateTask, 
    findTasks, 
    updateProjectProgress
} = require("../helpers/tasks.helpers");
const { createAndSendNotification } = require("../controllers/notification.controller");
const User = require("../models/user");

// ---------------------- new methods ----------------------------------

module.exports.findAll = async (req, res, next) =>{
    try {
        const { tasks, total } = await findTasks(req.query, true);
        return res.status(200).send({ message : 'Tasks retrieved successfully', data : { tasks, total } })
    } catch (error) {
        next(error)
    }
}

module.exports.findTaskByRefAndUser = async (req, res, next) =>{
    try {
        const { ref, email } = req.body;
        if(!ref) throw Error("Reference is required");
        if(!email) throw Error("User email is required");
        const user = await User.findOne({ email });
        if(!user) throw Error("User not found, please provide a correct user email");
        //check wheteher the task withthis ref exists or not
        const taskWithRef = await findTasks({ ref }, false);
        if(!taskWithRef.tasks)  throw new ApiError("Task with this ref doesnt exist", 200, true);
        //if task is closed, notify the user that the task is invalid
        const ClosedTask = await findTasks({ ref, Status : "Pending" }, false);
        if(!ClosedTask.tasks)  throw new ApiError("This task is invalid", 200, true);
        //check wheteher the task belongs to the requested user
        const taskForExecutor = await findTasks({ ref, Executor : user._id.toString() }, false);
        if(!taskForExecutor.tasks)  throw new ApiError("You are not executor in this task", 200, true);

        return res.status(200).send({ message : 'Task retrieved successfully', data : taskForExecutor.tasks, err : false, type : 'PMA' })
    } catch (error) {
        next(error)
    }
}

module.exports.defineTaskRatingWeight = async (req, res, next) =>{
    try {
        const task = await Task.findById(req.params.id);
        if(!task) throw Error("Task not found");
        task.ratingWeight = req.body.ratingWeight;
        await task.save();
        await updateUserNoteInProject(task.Project.toString(),task.Executor.map(e => e._id.toString()));

        //notify the executor of the weight definition
        const { tasks } = await findTasks({ id : task._id.toString()} ,false)
        
        const teamLeaderId = tasks.Project.TeamLeader._id.toString();
        const taskID = tasks._id.toString();
        let membersToNotify = tasks.Executor.map(u => u._id.toString());
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        }

        await createAndSendNotification(
            `Task weight configured by your team leader`, 
            `The new task created for you : ${tasks.Title} in project : ${tasks.Project.Projectname} has been given a weight by your team leader.`, 
            membersToNotify,
            taskID,
            'Task',
            teamLeaderId
        );


        return res.status(200).send({ message : 'Tasks weight set up successfully', data : { rating :  task.ratingWeight } })
    } catch (error) {
        next(error)
    }
}

module.exports.evaluateTask = async (req, res, next) =>{
    try {
        const task = await Task.findById(req.params.id);
        if(!task) throw Error("Task not found");
        task.note = req.body.note;
        const t = await task.save();
        await updateUserNoteInProject(t.Project.toString(),t.Executor.map(e => e._id.toString()));

        //notify the executor of the rating
        const { tasks } = await findTasks({ id : t._id.toString()} ,false)
        
        const teamLeaderId = tasks.Project.TeamLeader._id.toString();
        const taskID = tasks._id.toString();
        let membersToNotify = tasks.Executor.map(u => u._id.toString());
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        }

        await createAndSendNotification(
            `Task evaluated by your team leader`, 
            `The task you complete : ${tasks.Title} in project : ${tasks.Project.Projectname} has been evaluated by your team leader.`, 
            membersToNotify,
            taskID,
            'Task',
            teamLeaderId
        );

        return res.status(200).send({ message : 'Tasks note set up successfully', data : { _id : task._id, note :  task.note } })
    } catch (error) {
        next(error)
    }
}

module.exports.changeTaskProgress = async (req, res, next) =>{
    try {
        const task = await Task.findById(req.params.id);
        task.progress = req.body.progress;
        if (task.progress == 100) {
            task.Status = "Closed";
            task.closedAt = new Date();
        }else{
            task.Status = "Pending";
            task.closedAt = null; 
        } 
        const t =  await task.save();
        
        await updateProjectProgress(task.Project._id.toString());
        //if the the current task has many executors, ensure that all executors has the same note
        const taskExecutorsSet = new Set([
            ...task.Executor.map(executor => executor.toString()),
            `${req.headers.current_user}`
        ]);
        const taskExecutors = Array.from(taskExecutorsSet);
        await updateUserNoteInProject(t.Project.toString(), taskExecutors);
                
        const { tasks } = await findTasks({ id : req.params.id }, false);
        
        //send notification to team leader whenever a task closed
        if(tasks.progress === 100 && tasks.Status === 'Closed'){
            const teamLeaderId = tasks.Project.TeamLeader._id.toString();
            const taskID = tasks._id.toString();
            await createAndSendNotification(
                `Task closed`, 
                `Task : ${tasks.Title} in project : ${tasks.Project.Projectname} has been closed. You have now to evaluate it.`, 
                [teamLeaderId],
                taskID,
                'Task',
            );
        }

        return res.status(200).send({ message : 'Task progress updated successfully', data : tasks })
    } catch (error) {
        next(error)
    }
}



module.exports.findById = async (req, res, next) =>{
    try {
        const { tasks } = await findTasks({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Task retrieved successfully', data : tasks })
    } catch (error) {
        next(error)
    }
}

module.exports.findByTeamLeader = async (req, res, next) =>{
    try {
        const projects = await Project.find({ TeamLeader: req.params.userId });
    
        const taskPromises = projects.map(p => findTasks({ Project: p._id }, true));
        const leader_tasks = await Promise.all(taskPromises);

        const flattened_tasks = leader_tasks
        .map(projectTasks => projectTasks.tasks)
        .flat();
    
        return res.status(200).send({ message : 'Tasks retrieved successfully', data : {tasks : flattened_tasks, total : leader_tasks.length} })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async (req, res, next) =>{
    try {
        const { tasks } = await findTasks({ id : req.params.id }, false);
        if(!tasks){
            throw Error("Task not found");
        }
        await Task.findByIdAndDelete(req.params.id);
        await updateProjectProgress(tasks.Project._id.toString());
        await updateUserNoteInProject(tasks.Project._id.toString(),tasks.Executor.map(e => e._id.toString()));

        //send notitification to executors to notify them of this deletion
        const taskID = tasks._id.toString();
        const teamLeaderId = tasks.Project.TeamLeader._id.toString();

        let membersToNotify = tasks.Executor.map(u => u._id.toString());
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        }
        await createAndSendNotification(
            `Task deleted`, 
            `The team leader have deleted the task : ${tasks.Title} from the project : ${tasks.Project.Projectname}`, 
            membersToNotify,
            taskID,
            'Task',
            teamLeaderId
        );

        return res.status(200).send({ message : 'Task deleted successfully', data : { _id : req.params.id } })
    } catch (error) {
        next(error)
    }
}

module.exports.update = async function (req, res, next) {
    try {
        const { Title, Details, Executor, Priority,StartDate,Deadline, companions } = req.body;
        const parsedExecutor = typeof Executor == "string" ? JSON.parse(Executor) : Executor;
          if(!req.body.companions) {
            req.body.companions = []
        }
        const parsedCompanions = typeof companions == "string" ? JSON.parse(companions) : companions;
        const updatedTask = { 
            Title, 
            Details, 
            Executor : parsedExecutor, 
            Priority, 
            StartDate : StartDate, 
            Deadline : Deadline,
            companions : parsedCompanions 
            // StartDate : new Date(Deadline).setHours(0, 0, 0, 0), 
            // Deadline : new Date(Deadline).setHours(23, 59, 0, 0) 
        };
        const task = await Task.findByIdAndUpdate(req.params.id, { $set: updatedTask }, { new : true });
        await updateProjectProgress(task.Project._id.toString());
        const { tasks } = await findTasks({ id : task._id }, false);

        let membersToNotify = tasks.Executor.map(u => u._id.toString());
        const teamLeaderId = tasks.Project.TeamLeader._id.toString();
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        }
        const taskID = tasks._id.toString();
        await createAndSendNotification(
            `Task updated`, 
            `The team leader have updated some details in the task : ${tasks.Title} from the project : ${tasks.Project.Projectname}`, 
            membersToNotify,
            taskID,
            'Task',
            teamLeaderId
        );

        return res.status(200).json({ message: "Task updated successfully", data : tasks });
    } catch (error) {
        next(Error("Error while updating task"));
    }
}

module.exports.create = async function (req, res, next) {
    try {
        const isValid = validateTask(req.body);
        if(!isValid) throw Error("Invalid task details");
        // we parsed executors and companions here beacause flutter send them as raw string
        const parsedExecutor = typeof req.body.Executor == "string" ? JSON.parse(req.body.Executor) : req.body.Executor;
        if(!req.body.companions) {
            req.body.companions = []
        }
        const parsedCompanions = typeof req.body.companions == "string" ? JSON.parse(req.body.companions) : req.body.companions;
        const ref = await generateRef();
        let task = new Task({
            ...req.body, 
            ref,
            Executor : parsedExecutor,
            companions : parsedCompanions
        });
        const saved_task = await task.save();
        const { tasks } = await findTasks({ id : saved_task._id }, false);
        await updateProjectProgress(tasks.Project._id.toString());
        await updateUserNoteInProject(tasks.Project._id.toString(),tasks.Executor.map(e => e._id.toString()));
        
        //send notifications to the task executors
        //remove team leader from executors if he is part of the executors
        const teamLeaderId = tasks.Project.TeamLeader._id.toString();
        let membersToNotify = tasks.Executor.map(u => u._id.toString());
        if(membersToNotify.includes(teamLeaderId)){
            membersToNotify = membersToNotify.filter(id => id !== teamLeaderId);
        }
        await createAndSendNotification(
            `A new task has been created`, 
            `The team leader has created a new task for you in your project : ${tasks.Project.Projectname}`, 
            membersToNotify,
            tasks._id.toString(),
            'Task',
            teamLeaderId
        );
        //send notitification to team leader to configure the new task weight
        await createAndSendNotification(
            `A new task has been created`, 
            `You have to configure the weight of the new task you have created in the project : ${tasks.Project.Projectname}`, 
            [teamLeaderId],
            tasks._id.toString(),
            'Task',
        );
        return res.status(200).send({ message : "Task saved successfully", data : tasks });
    } catch (error) {
        next(error)
    }
};

module.exports.findEngineerTasks = async (req, res, next)=>{
    try {
        const pending = await findTasks({ Status : 'Pending', Executor : req.params.userId  }, true)
        const closed = await findTasks({ Status : 'Closed', Executor : req.params.userId  }, true)
        const all = await findTasks({ Executor : req.params.userId  }, true);
        const tasks = { 
            pending : pending.total,
            closed : closed.total,
            all : all.total
        }
        return res.status(200).send({ message : 'Tasks retrieved successfully', data : tasks })
    } catch (error) {
        
    }
}
const ProjectRating = require("../models/projectRating.model");
const Task = require("../models/task");
const Project = require("../models/project");
const ProjectFile = require("../models/project_file")

async function getProjectRatingObject(projectId) {
    try {
        if(!projectId) throw Error("Invalid projectID");
        let projectRating = await getSingleRatingObject({ project: projectId });
        if (!projectRating) {
            //create a new project rating for the project if doesnt exist
            projectRating = await ProjectRating.create({
                project: projectId,
                membersNotes: [],
                teamLeaderNote: 0,
                teamLeaderGivenNote: []
            });
            projectRating = await getSingleRatingObject({ _id : projectRating._id })
        }
        const project = await Project.findById(projectId);
        project.rating = projectRating;
        await project.save();
        return projectRating;
    } catch (error) {
        throw error;
    }
}
//exported it as a single method to facilite the test only
async function getSingleRatingObject(filter){
    return await ProjectRating.findOne(filter)
        .populate({
            path: 'project',
        })
        .populate({
            path: 'membersNotes.member',
            select: '-password -isEnabled'
        })
        .populate({
            path: 'memberToTeamLeaderRatings.member',
            select: '-password -isEnabled'
        });
}
async function updateUserNoteInProject(projectId, taskExecutors) {
    try {
        const ratingObject = await getProjectRatingObject(projectId);

        for (const userId of taskExecutors) {
            let memberScore = 0;

            // Get tasks for the given users
            const assignedTasks = await getAssignedTasksForGivenUser(projectId, userId);
            const closedTasks = await getCompletedTasksForGivenUser(projectId, userId);
            const inTimeTasks = await getInTimeClosedTasksForGivenUser(projectId, userId);
            const assignedtasksScore = await getAssignedTasksScoreForGivenUser(projectId, userId);

            // extract tasks weight
            const closedtasksWeight = closedTasks.weight;
            const assignedTasksWeight = assignedTasks.weight;
            const inTimeTasksWeight = inTimeTasks.weight;
            const assignedTasksNumber = assignedTasks.tasks.length;
            const assigndTasksScore = assignedtasksScore.score;

            if (assignedTasksWeight === 0 || assignedTasksNumber === 0) {
                memberScore = 0;
            } else {
                memberScore =
                    (closedtasksWeight / assignedTasksWeight) * 50 +
                    (inTimeTasksWeight / assignedTasksWeight) * 30 +
                    ((assigndTasksScore / assignedTasksNumber) / 5) * 20;
            }
            //check if the member of the project has already a note 
            const existingMember = ratingObject.membersNotes.find(
                (m) => m.member._id.toString() === userId.toString()
            );

            if (existingMember) {
                existingMember.note = Math.round(memberScore);
            } else {
                ratingObject.membersNotes.push({ member: userId, note: Math.round(memberScore) });
            }
        }
        //save the update rating object
        const savedRatingObject = await ratingObject.save();
        //recalculate the global project rating
        const updatedRating = await CalculateGlobalRatingForProject(projectId);
        return { membersNotes : savedRatingObject.membersNotes, globalNote : updatedRating };
    } catch (error) {
        throw error;
    }
}
async function updateTeamLeaderNoteInProject(projectId) {
    try {
        const ratingObject = await getProjectRatingObject(projectId);
        const membersNotes = ratingObject.memberToTeamLeaderRatings.map(item => item.note);
        const existProject = await Project.findById(projectId);
        //to verify if the team leader is part of the equie(has tasks or not, 
        // if has task it he will be added to the equipe length, so the score will be correct)
        let equipe = new Set([
            ...ratingObject.membersNotes.map(i => i.member._id.toString()),
            existProject.TeamLeader._id.toString(),
            ...existProject.equipe.map(e => e._id.toString())
        ]);
        const equipeSize = equipe.size;
        const membersNoteSum = membersNotes.reduce((acc, x)=>acc+=x,0) 
        const averageRating = membersNoteSum/equipeSize;
        const managerNote = ratingObject.managerToTeamLeaderRating;
        const inTimeTasks = await getInTimeClosedTasksForGivenProject(projectId);
        const allTasks = await getProjectTasksWeight(projectId);
        const deadlineCompliance = allTasks.weight == 0 ? 0 : inTimeTasks.weight/allTasks.weight;
        //this the formula  for the team leader note in the project
        //the average rating is the average note given my members to the team leader
        const finalTLNote = Math.round(averageRating * 0.2 + managerNote * 0.5 + deadlineCompliance * 0.3);
        const project = await Project.findById(projectId);
        project.teamLeaderNote = finalTLNote;
        await project.save();
        const updatedRating = await CalculateGlobalRatingForProject(projectId);
        return { teamLeaderNote : finalTLNote, globalNote : updatedRating };
    } catch (error) {
        throw error;
    }
}
//gest tasks data for a specific project
async function getCompletedTasksForGivenUser(projectId, userId){
    try {
        if(!projectId || !userId) throw Error("Invalid userID/projectID");
        const closedTasks = await Task.find({ Project : projectId, Executor : { $in : [userId] }, progress : 100, Status : "Closed" });
        const weight = closedTasks.reduce((acc, el) => acc + (el.ratingWeight || 0), 0);
        return { tasks :  closedTasks, weight };
    } catch (error) {
        throw error;
    }
}
async function getAssignedTasksScoreForGivenUser(projectId, userId){
    try {
        if(!projectId || !userId) throw Error("Invalid userID/projectID");
        const assignedTasks = await Task.find({ Project : projectId, Executor : { $in : [userId] } });
        const score = assignedTasks.reduce((acc, el) => acc + (el.note || 0), 0);
        return { tasks :  assignedTasks, score };
    } catch (error) {
        throw error;
    }
}
async function getAssignedTasksForGivenUser(projectId, userId) {
    try {
        if (!projectId || !userId) {
            throw new Error("Invalid projectID/projectID");
        }
        const assignedTasks = await Task.find({ 
            Project: projectId, 
            Executor: { $in: [ userId ] } 
        });
        const weight = assignedTasks.reduce((acc, el) => acc + (el.ratingWeight || 0), 0);
        return { tasks: assignedTasks, weight };
    } catch (error) {
        throw error;
    }
}
async function getInTimeClosedTasksForGivenUser(projectId, userId){
    try {
        if(!projectId || !userId) throw Error("Invalid userID/projectID");
        const tasks = await Task.find({
            Project: projectId,
            Executor: { $in: [userId] },
            progress: 100,
            Status: "Closed",
        });
        // Filter tasks closed in time
        const filteredTasks = tasks.filter(task => {
            const closedAt = new Date(task.closedAt);
            const deadline = new Date(task.Deadline);
            return closedAt <= deadline;
        });
        const weight = filteredTasks.reduce((acc, el) => acc + (el.ratingWeight || 0), 0);
        return { tasks: filteredTasks, weight};
    } catch (error) {
        throw error;
    }
}
async function getInTimeClosedTasksForGivenProject(projectId){
    try {
        if(!projectId) throw Error("Invalid projectID");
        const tasks = await Task.find({
            Project: projectId,
            progress: 100,
            Status: "Closed",
        });
        // Filter tasks closed in time
        const filteredTasks = tasks.filter(task => {
            const closedAt = new Date(task.closedAt);
            const deadline = new Date(task.Deadline);
            return closedAt <= deadline;
        });
        const weight = filteredTasks.reduce((acc, el) => acc + (el.ratingWeight || 0), 0);
        return { tasks: filteredTasks, weight};
    } catch (error) {
        throw error;
    }
}
async function getProjectTasksWeight(projectId){
    try {
        if(!projectId) throw Error("Invalid projectID");
        const tasks = await Task.find({ Project: projectId });
        const weight = tasks.reduce((acc, el) => acc + (el.ratingWeight || 0), 0);
        return { tasks, weight};
    } catch (error) {
        throw error;
    }
}
async function CalculateGlobalRatingForProject(projectId){
    try {
        let bonusOfCompletion = 0;
        let filesNote = 0;
        let equipeNote = 0;
        let lettreNote = 0;
        let clientNote = 0;
        //======================== les pourcentages de note =======================
        const FILES_NOTE_PERCENTAGE = 30;
        const LETTER_NOTE_PERCENTAGE = 10;
        const BONUS_OF_COMPLETION_PERCENTAGE = 10;
        const EQUIPE_NOTE_PERCENTAGE = 30;
        const CLIENT_NOTE_PERCENTAGE = 20;
        
        const project = await Project.findById(projectId);
        //change files note if there is uploaded files
        if(project.hasFilesRatingConfig && project.requiredRatingFiles.length > 0){
            const requiredFiles = project.requiredRatingFiles;
            const uploadedFiles = await ProjectFile.find({ 
                project : projectId, 
                type : { 
                    $in: requiredFiles.map(file => new RegExp(`^${file}$`, 'i')) 
                } 
            });
            if(requiredFiles.length !== 0){
                filesNote = ( uploadedFiles.length / requiredFiles.length ) * FILES_NOTE_PERCENTAGE;
            }
        } ;
        if(project.note_Client){
            clientNote = (project.note_Client / 100 ) * CLIENT_NOTE_PERCENTAGE;
        }
        const lettreRemerciment = await ProjectFile.find({ 
            project : projectId, 
            type : { $regex : 'APPRECIATION LETTER', $options : 'i' } 
        });
        
        if(lettreRemerciment.length != 0){
            lettreNote = LETTER_NOTE_PERCENTAGE;
        };
        //check if project is before deadline
        if(project.closedAt){
            if(new Date(project.closedAt) <= new Date(project.dateFin)){
                bonusOfCompletion = BONUS_OF_COMPLETION_PERCENTAGE;
            };
        }
        //get team leader rating + get team members rating 
        const teamLeaderNote = project.teamLeaderNote ? (project.teamLeaderNote/100)*0.5 : 0;
        const projectRating = await getProjectRatingObject(projectId);
        const membersAverageRating =
        projectRating.membersNotes.length > 0
        ? (projectRating.membersNotes.map(x => x.note).reduce((acc, x) => acc + x, 0) /
        projectRating.membersNotes.length) /
        100 *
        0.5
        : 0;
        //the equipe final note
        equipeNote = (teamLeaderNote + membersAverageRating) * EQUIPE_NOTE_PERCENTAGE;
        const globalRating = filesNote + clientNote + equipeNote + lettreNote + bonusOfCompletion;
        
        project.finalRating = Math.round(globalRating);
        await project.save();
        return globalRating;
    } catch (error) {
        throw error
    }
}

module.exports = {
    getCompletedTasksForGivenUser,
    getInTimeClosedTasksForGivenUser,
    updateUserNoteInProject,
    getProjectRatingObject,
    getAssignedTasksForGivenUser,
    getAssignedTasksScoreForGivenUser,
    updateTeamLeaderNoteInProject,
    getInTimeClosedTasksForGivenProject,
    CalculateGlobalRatingForProject,
    getSingleRatingObject
}
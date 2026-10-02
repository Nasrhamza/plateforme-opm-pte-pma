const { 
    getProjectRatingObject, 
    getAssignedTasksForGivenUser, 
    getCompletedTasksForGivenUser,
    getAssignedTasksScoreForGivenUser, 
    getInTimeClosedTasksForGivenUser,
    updateTeamLeaderNoteInProject,
    CalculateGlobalRatingForProject
} = require("../helpers/rating.helpers");
const Project = require("../models/project");
const { createAndSendNotification } = require("../controllers/notification.controller");

module.exports.getProjectRatingOverview = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        if (!projectId) throw new Error("Invalid project ID");

        const projectRating = await getProjectRatingObject(projectId);
        const project = await Project.findById(projectId);
        const members = projectRating.membersNotes.map(item => ({
            member: item.member,
            note: item.note,
        }));

        const overview = await getTasksOverviewForUsers(members, projectId);
        const data = { 
            ...projectRating.toObject(),
            membersNotes : overview,
            managerNote : projectRating.managerToTeamLeaderRating,
            teamLeaderGlobalNote : project.teamLeaderNote ?? 0
        }
        return res.status(200).send({ 
            message: "Ratings retrieved successfully", data });
    } catch (error) {
        next(error);
    }
};

module.exports.managerEvaluateTeamLeader = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { note } = req.body;
        if(!projectId) throw Error("Invalid project ID");
        if(!note || note == 0) throw Error("Invalid note");
        const ratingObject = await getProjectRatingObject(projectId);
        ratingObject.managerToTeamLeaderRating = note;
        await ratingObject.save();
        const { teamLeaderNote, globalRating } = await updateTeamLeaderNoteInProject(projectId);
        // const projectFinalNote = await CalculateGlobalRatingForProject(projectId);
        return res.status(200).send({ message : "Team leader has been rated successfully", data : { teamLeaderNote, globalRating  } });
    } catch (error) {
        next(error);
    }
}
module.exports.memberEvaluateTeamLeader = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { note, userId } = req.body;
        if(!projectId) throw Error("Invalid project ID");
        if(!note || note == 0) throw Error("Invalid note");
        const ratingObject = await getProjectRatingObject(projectId);
        const existingMember = ratingObject.memberToTeamLeaderRatings.find((m) => m.member._id.toString() === userId.toString());
        if (existingMember) {
            existingMember.note = Math.round(note);
        } else {
            ratingObject.memberToTeamLeaderRatings.push({ member: userId, note: Math.round(note) });
        }  
        await ratingObject.save();
        await CalculateGlobalRatingForProject(projectId);

        //notify the admin to note the team leader  
        const updatedProject = await Project.findById(projectId);
        const teamLeaderId = updatedProject.TeamLeader.toString();
        // sorry for this hardcoded value
        if(updatedProject.status === 'Completed'){
            //checkif all members od the team evaluated the team leader before sending notif to the admin
            if(ratingObject.memberToTeamLeaderRatings.length === updatedProject.equipe.length){
                await createAndSendNotification(
                    `Project completed`, 
                    `Project : ${updatedProject.Projectname} have been completed. Don't forget to evaluate the team leader`, 
                    ['admin'],
                    updatedProject._id.toString(),
                    'Project',
                    teamLeaderId
                );
            }
        }

        return res.status(200).send({ message : "Your note has been sent successfully", data : note });
    } catch (error) {
        next(error);
    }
}

async function getTasksOverviewForUsers(members, projectId) {
    return await Promise.all(
        members.map(member => getTasksOverviewForGivenUser(member, projectId))
    );
}
async function getTasksOverviewForGivenUser(user, projectId) {
    const userId = user.member._id.toString();

    const [ assignedTasks, closedTasks, assignedTasksScore, inTimeClosedTasks ] = await Promise.all([
        getAssignedTasksForGivenUser(projectId, userId),
        getCompletedTasksForGivenUser(projectId, userId),
        getAssignedTasksScoreForGivenUser(projectId, userId),
        getInTimeClosedTasksForGivenUser(projectId, userId)
    ]);

    return {
        note: user.note,
        user: user.member,
        assignedTasks: { 
            tasks: assignedTasks.tasks.length, 
            weight: assignedTasks.weight 
        },
        closedTasks: { 
            tasks: closedTasks.tasks.length, 
            weight: closedTasks.weight 
        },
        assignedTasksScore: assignedTasksScore.score,
        inTimeClosedTasks: { tasks : inTimeClosedTasks.tasks.length, weight : inTimeClosedTasks.weight },
    };
}

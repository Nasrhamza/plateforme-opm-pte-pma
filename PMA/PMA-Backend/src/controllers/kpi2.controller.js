const Project = require('../models/project');
const User = require('../models/user');
const Task = require('../models/task');
const ProjectFile = require('../models/project_file');
const { findProjects } = require('../helpers/projects.helpers');

//controller

module.exports.getKpis = async (req, res, next)=>{
    try {
        const projectsOverview = await getProjectsOverview();
        const tasksOverview = await getTasksOverview();
        return res.status(200).send({  
            data : {
                tasksOverview : tasksOverview,
                projectsOverview : projectsOverview
            },
            message : "Kpis retrieved successfully" 
        })
    } catch (error) {
        next(Error("Error while getting kpis"))
    }
}


//helpers methods
async function getAverageProjectDuration(){
    try {
        const projects = await Project.find({ status:  { $in: ['Completed', 'Overdue'] }, dateFin: { $exists: true } });
        if (projects.length === 0) {
            return { averageProjectsDuration : 0 } 
        }
        const totalDuration = projects.reduce((sum, p) => {     // reduce tehseb durée mta3 kol projet (p) w tzidou fi sum
            if (!p.dateDebut || !p.dateFin) return sum;            // skip projects eli ma aandhomch debut wala fin
                const start = new Date(p.dateDebut);
                const end = new Date(p.dateFin);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));          //math.ceil() ta3mel arrondi superieur
            return sum + days;
        }, 0);
        const avgDuration = totalDuration / projects.length;
        return avgDuration.toFixed(1);   // toFixed(1) ta3mel arrondi 3la 1 chiffre après la virgule 
    } catch (err) {
        throw Error("error while getting average project duration")       
    }
};


async function getInTimeProjectsDeliveryRate() {
    const all = await Project.find();
    const completed = await Project.find({ status: 'Completed' });
    const pending = await Project.find({ status: 'Pending' });
    const overdue = await Project.find({ status: 'Overdue' });
    const completedCount = completed.length;
    const overdueCount = overdue.length;
    const pendingCount = pending.length;
    const allCount = all.length;
    const totalCount = completedCount + overdueCount;
    const inTimeCount = completedCount - overdueCount;
    const rate = totalCount > 0 ? (inTimeCount / totalCount) * 100 : 0;
    return { rate: rate.toFixed(2), inTime : inTimeCount, overdue : overdueCount, pending : pendingCount, all : allCount };
    
}

async function getTop5LongestAndShortestProjects() {
    const { projects } = await findProjects({ dateDebut: { $ne: null }, dateFin: { $ne: null } }, true);
    const withDuration = projects.map(p => {
        const calculated = Math.abs((new Date(p.dateFin) - new Date(p.dateDebut)) / (1000 * 60 * 60 * 24));
        return {
            project: p,
            duration: calculated == 0 ? 1 : calculated
    }
    });
    const sorted = withDuration.sort((a, b) => b.duration - a.duration);
    return {
        longest: sorted.slice(0, 5),
        shortest: sorted.slice(-5).reverse()
    };
};

async function getProjectsStatusPercentage() {
    const all = await Project.countDocuments();
    const completed = await Project.countDocuments({ status : "Completed" });
    const pending = await Project.countDocuments({ status : "Pending" });
    const overdue = await Project.countDocuments({ status : "Overdue" })
    const inProgress = await Project.countDocuments({ status : "In Progress" })
    return {
        completed : Math.round(completed/all*100),
        pending : Math.round(pending/all*100),
        overdue : Math.round(overdue/all*100),
        inProgress : Math.round(inProgress/all*100)
    };
};


async function getLateTaskRate (){

    const all = await Project.find();
    const completedTasks = await Project.find({ status: "Completed" });
    const pendingTasks = await Project.find({ status: "Pending" });

    const currentLateTasksCount = await Task.countDocuments(
        {  
            Status: { $ne: "Completed" },  
            Deadline: { $lt: new Date() }   
        }
    );

    const allCount = all.length;
    const pendingCount = pending.length;
    const completedCount = completedTasks.length;
    const lateCount = completedTasks.filter(task => task.closedAt && task.Deadline && task.closedAt > task.Deadline).length;

    //get average task duration by executor

    const avgTaskDurationByExecutor = await Task.aggregate([
            {
                $match: { Status: "Completed", Deadline: { $exists: true } } 
            },
            {
                $group: {
                _id: "$Executor",
                avgDuration: { $avg: { $subtract: ["$Deadline", "$StartDate"] } } 
                }
            },
            {
                $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "engineer"
                }
            },
            {
                $project: {
                engineer: { $arrayElemAt: ["$engineer.fullName", 0] },
                avgDurationHours: { $divide: ["$avgDuration", 1000 * 60 * 60] } 
                }
            }
        ]);

    const lateRate = completedCount == 0 ? 0 : (lateCount / completedCount) * 100;

    return { lateRate : lateRate.toFixed(2), all : allCount, pending : pendingCount, late : currentLateTasksCount, completed : completedCount, avgTaskDurationByExecutor  }
}

async function getTasksOverview() {
  // Date actuelle
    const now = new Date();

    // Récupérer toutes les tâches
    const tasks = await Task.find();

    const totalTasks = tasks.length;

    // --- KPIs ---
    const overdueTasks = tasks.filter(
        (t) => t.Deadline && t.Deadline < now && t.Status !== "Closed"
    );
    const closedTasks = tasks.filter((t) => t.Status === "Closed");
    const pendingTasks = tasks.filter((t) => t.Status !== "Closed");

    const overdueRate = totalTasks > 0 ? (overdueTasks.length / totalTasks) * 100 : 0;
    const closedRate = totalTasks > 0 ? (closedTasks.length / totalTasks) * 100 : 0;

    // Progression moyenne
    const avgProgress =
        totalTasks > 0
        ? tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks
        : 0;

    // Distribution par priorité
    const priorities = tasks.reduce((acc, t) => {
        acc[t.Priority] = (acc[t.Priority] || 0) + 1;
        return acc;
    }, {});

    // Distribution par statut
    const statusDist = tasks.reduce((acc, t) => {
        acc[t.Status] = (acc[t.Status] || 0) + 1;
        return acc;
    }, {});

    return {
        totalTasks,
        overdueTasks: overdueTasks.length,
        overdueRate: overdueRate.toFixed(2) + "%",
        closedTasks: closedTasks.length,
        closedRate: closedRate.toFixed(2) + "%",
        pendingTasks: pendingTasks.length,
        avgProgress: avgProgress.toFixed(2) + "%",
        priorities,
        statusDist,
    };
}
async function getProjectsOverview() {
    const now = new Date();
    const projects = await Project.find();

    const totalProjects = projects.length;

    const closedProjects = projects.filter(
        (p) => p.status === "Closed" || p.closedAt
    );
    const overdueProjects = projects.filter(
        (p) => p.dateFin && p.dateFin < now && !p.closedAt
    );

    const closedRate =
        totalProjects > 0 ? (closedProjects.length / totalProjects) * 100 : 0;
    const overdueRate =
        totalProjects > 0 ? (overdueProjects.length / totalProjects) * 100 : 0;

    // Moyenne progression
    const avgProgress =
        totalProjects > 0
        ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects
        : 0;

    // Distribution par priorité
    const priorities = projects.reduce((acc, p) => {
        acc[p.priority] = (acc[p.priority] || 0) + 1;
        return acc;
    }, {});

    // Distribution par statut
    const statusDist = projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    // Notes moyennes
    const avgTeamLeaderNote =
        projects.reduce((s, p) => s + (p.teamLeaderNote || 0), 0) / totalProjects || 0;
    const avgClientNote =
        projects.reduce((s, p) => s + (p.note_Client || 0), 0) / totalProjects || 0;
    const avgAdminNote =
        projects.reduce((s, p) => s + (p.note_Admin || 0), 0) / totalProjects || 0;
    const avgFinalRating =
        projects.reduce((s, p) => s + (p.finalRating || 0), 0) / totalProjects || 0;

    // Fichiers requis
    const withFilesConfig = projects.filter((p) => p.hasFilesRatingConfig).length;
    const withLetter = projects.filter((p) => p.letterUploaded).length;

    // % fichiers fournis
    const filesProvidedRate =
        projects.length > 0
        ? (projects.reduce((sum, p) => {
            if (p.requiredRatingFiles?.length > 0) {
                return sum + (p.providedRequiedFiles / p.requiredRatingFiles.length);
            }
            return sum;
            }, 0) / projects.length) * 100
        : 0;

    // Durée moyenne
    const avgDuration =
        projects.reduce((sum, p) => {
        if (p.dateDebut && p.dateFin) {
            return sum + (p.dateFin - p.dateDebut);
        }
        return sum;
        }, 0) / (projects.filter((p) => p.dateDebut && p.dateFin).length || 1);

    return {
        totalProjects,
        closedProjects: closedProjects.length,
        closedRate: closedRate.toFixed(2) + "%",
        overdueProjects: overdueProjects.length,
        overdueRate: overdueRate.toFixed(2) + "%",
        avgProgress: avgProgress.toFixed(2) + "%",
        priorities,
        statusDist,
        notes: {
        avgTeamLeaderNote: avgTeamLeaderNote.toFixed(2),
        avgClientNote: avgClientNote.toFixed(2),
        avgAdminNote: avgAdminNote.toFixed(2),
        avgFinalRating: avgFinalRating.toFixed(2),
        },
        files: {
        withFilesConfig,
        withLetter,
        filesProvidedRate: filesProvidedRate.toFixed(2) + "%",
        },
        avgDurationDays: Math.round(avgDuration / (1000 * 60 * 60 * 24)),
    };
}



// module.exports = {
//     getTop5LongestAndShortestProjects
// }
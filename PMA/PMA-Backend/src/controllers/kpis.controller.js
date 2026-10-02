const Project = require('../models/project');
const User = require('../models/user');
const Task = require('../models/task');
const ProjectFile = require('../models/project_file');


exports.getAverageProjectDuration = async (req, res, next) => {
try {
    const projects = await Project.find({ status:  { $in: ['Completed', 'Overdue'] }, dateFin: { $exists: true } });
    if (projects.length === 0) {
      return res.json({ avgDuration: 0 }); 
    }
    const totalDuration = projects.reduce((sum, p) => {     // reduce tehseb durée mta3 kol projet (p) w tzidou fi sum
    if (!p.dateDebut || !p.dateFin) return sum;            // skip projects eli ma aandhomch debut wala fin
  const start = new Date(p.dateDebut);
  const end = new Date(p.dateFin);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));          //math.ceil() ta3mel arrondi superieur
  return sum + days;
}, 0);
    const avgDuration = totalDuration / projects.length;
    res.json({ avgDuration: avgDuration.toFixed(1) });                // toFixed(1) ta3mel arrondi 3la 1 chiffre après la virgule 
  } catch (err) {
    console.error(err);
    next(err)               
  }
};



exports.getOnTimeDeliveryRate = async (req, res, next) => {
  try {
    const completed = await Project.find({ status: 'Completed' });
    const late = await Project.find({ status: 'Overdue' });
    const totalDelivered = completed.length + late.length;
    const onTime = completed.length;
    const rate = totalDelivered > 0 ? (onTime / totalDelivered) * 100 : 0;
    res.json({ onTimeDeliveryRate: rate.toFixed(2) });
  } catch (error) {
    console.error(err);
    next(err) 
  }
};

//duplicated

exports.getLateProjectsCount = async (req, res) => {
  const lateProjects = await Project.find({ status: 'Overdue' });
  res.json({ lateProjects: lateProjects.length });
};




//duplicated
exports.getProjectStatusRatio = async (req, res) => {
  const completed = await Project.countDocuments({ status: { $in: ['Completed', 'Overdue'] } });
  res.json({ completed });
};




//duplicated
exports.getProjectsByTeamLeaders = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: "$TeamLeader",
          projectCount: { $sum: 1 }
        }
      },
      {
        $lookup: {     // bech traj3elna les details mta3 team leader
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "leader"
        }
      },
      {
        $unwind: "$leader"
      },
      {
        $project: {   //bech nekhdhou juste les champs eli nestha9ouhom 
          leaderId: "$_id",
          leaderName: "$leader.fullName",
          projectCount: 1
        }
      },
      {
        $sort: { projectCount: -1 }   //tri
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error(err);
    next(err) 
  }
};


//duplicated
exports.getProjectsStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      completed: stats.find(s => s._id === 'Completed')?.count || 0,
      inProgress: stats.find(s => s._id === 'In Progress')?.count || 0
    };

    res.json(result);
  } catch (err) {
   console.error(err);
    next(err) 
  }
};



//engineer particicpation already defined
exports.getProjectsByEngineer = async (req, res, next) => {
  try {
    const result = await Project.aggregate([
      { $unwind: "$equipe" },
      {
        $lookup: {
          from: "users", 
          localField: "equipe",
          foreignField: "_id",
          as: "engineer"
        }
      },
      { $unwind: "$engineer" },
      {
        $group: {
          _id: "$engineer.fullName", 
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(result);
  } catch (err) {
   console.error(err);
    next(err) 
  }
};




exports.getTop5LongestProjects = async (req, res) => {
  const projects = await Project.find({ dateDebut: { $ne: null }, dateFin: { $ne: null } });
  const withDuration = projects.map(p => ({
    name: p.Projectname,
    duration: (new Date(p.dateFin) - new Date(p.dateDebut)) / (1000 * 60 * 60 * 24)
  }));
  const sorted = withDuration.sort((a, b) => b.duration - a.duration).slice(0, 5);
  res.json(sorted);
};



exports.getTop5ShortestProjects = async (req, res) => {
  const projects = await Project.find({ dateDebut: { $ne: null }, dateFin: { $ne: null } });
  const withDuration = projects.map(p => ({
    name: p.Projectname,
    duration: (new Date(p.dateFin) - new Date(p.dateDebut)) / (1000 * 60 * 60 * 24)
  }));
  const sorted = withDuration.sort((a, b) => a.duration - b.duration).slice(0, 5);
  res.json(sorted);
};




exports.getLateTaskRate = async (req, res) => {
  try {
    const completedTasks = await Project.find({ status: "Completed" });

    const total = completedTasks.length;
    const lateCount = completedTasks.filter(task => task.closedAt && task.Deadline && task.closedAt > task.Deadline).length;

    const lateRate = total === 0 ? 0 : (lateCount / total) * 100;

    res.status(200).json({ lateRate: lateRate.toFixed(2) }); 
  } catch (err) {
    console.error(err);
    next(err)}
};



exports.getCurrentLateTasks = async (req, res) => {
  const count = await Task.countDocuments({  Status: { $ne: "Completed" },  
    Deadline: { $lt: new Date() }   });
  res.json({ currentLateTasks: count });
};




exports.getAvgTaskDuration = async (req, res, next) => {
  try {
    const tasks = await Task.aggregate([
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
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    next(err)}
};





exports.getCompletedTasks = async (req, res, next) => {
  try {
    const { period } = req.query; 
    let startDate;
    if (period === "weekly") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else { 
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const tasks = await Task.aggregate([
      {
        $match: { 
          Status: "Completed", 
          Deadline: { $gte: startDate } 
        }
      },
      {
        $group: {
          _id: "$Executor",
          count: { $sum: 1 }
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
          tasksCompleted: "$count"
        }
      }
    ]);
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    next(err)}
};




exports.getEngineersOccupancy = async (req, res) => {

  const totalAvailableHours = 160; 
  const tasks = await Task.aggregate([
    { $match: { Status: "In Progress" } },
    { $unwind: "$Executor" },
    {
      $group: {
        _id: "$Executor", 
        totalActiveHours: {
          $sum: {
            $divide: [
              { $subtract: ["$Deadline", "$StartDate"] },
              1000 * 60 * 60 
            ]
          }
        }
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
    { $unwind: "$engineer" },
    {
      $project: {
        _id: 0,
        engineerName: "$engineer.fullName",
        totalActiveHours: 1,
        occupancyRate: {
          $multiply: [
            { $divide: ["$totalActiveHours", totalAvailableHours] },
            100
          ]
        }
      }
    }
  ]);
  res.json(tasks);
};




exports.getMostReliableEngineer = async (req, res) => {
  const result = await Task.aggregate([
    { $match: { Status: "Completed" } },
    { $unwind: "$Executor" },
    {
      $group: {
        _id: "$Executor",
        totalTasks: { $sum: 1 },
        lateTasks: {
          $sum: {
            $cond: [
              { $gt: ["$EndDate", "$Deadline"] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $addFields: {
        reliabilityRate: {
          $multiply: [
            { $divide: [{ $subtract: ["$totalTasks", "$lateTasks"] }, "$totalTasks"] },
            100
          ]
        }
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
    { $unwind: "$engineer" },
    { $sort: { reliabilityRate: -1, totalTasks: -1 } },
    { $limit: 1 },
    {
      $project: {
        _id: 0,
        engineerName: "$engineer.fullName",
        totalTasks: 1,
        lateTasks: 1,
        reliabilityRate: 1
      }
    }
  ]);
  res.json(result[0] || {});
};




exports.getClientSatisfaction = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      {
        $match: {
          note_Client: { $exists: true, $gt: 0 } 
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$note_Client" },
          totalRated: { $sum: 1 },
          distribution: {
            $push: {
              project: "$Projectname",
              rating: "$note_Client"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ["$averageRating", 1] },
          totalRated: 1,
          distribution: 1
        }
      }
    ]);
    const result = stats[0] || { 
      averageRating: 0, 
      totalRated: 0, 
      distribution: [] 
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err)}
};


exports.getDeliveryConformityRate = async (req, res) => {
 try {
    const totalDelivered = await Project.countDocuments({ status: "Completed" });
    const compliantDelivered = await Project.countDocuments({ status: "Completed", scopeChanged:false });

    const complianceRate = totalDelivered === 0 ? 0 : (compliantDelivered / totalDelivered) * 100;

    res.status(200).json({ complianceRate: complianceRate.toFixed(2) }); 
  } catch (err) {
    console.error(err);
    next(err)}
};



exports.getAverageTeamSizePerProject= async (req, res) => {
  try {
    const projects = await Project.find({ equipe: { $exists: true, $ne: [] } });
    const teamSizes = projects.map(p => ({
      project: p.Projectname,
      size: p.equipe.length
    }));
    
    const average = projects.reduce((sum, p) => sum + p.equipe.length, 0) / projects.length;
    
    res.json({ teamSizes, average: average.toFixed(1) });
  } catch (err) {
    console.error(err);
    next(err)}
};


exports.getTimeComparison = async (req, res) => {
  try {
    const projects = await Project.find({ 
      dateDebut: { $exists: true }, 
      dateFin: { $exists: true } 
    });
    
    const comparison = projects.map(p => {
      const estimatedDays = p.dateFin ? Math.ceil((p.dateFin - p.dateDebut) / (1000 * 3600 * 24)) : 0;
      const actualDays = p.closedAt ? Math.ceil((p.closedAt - p.dateDebut) / (1000 * 3600 * 24)) : 0;
      
      return {
        project: p.Projectname,
        estimated: estimatedDays,
        actual: actualDays,
        difference: actualDays - estimatedDays
      };
    });
    
    res.json(comparison);
  } catch (err) {
    console.error(err);
    next(err)}
};


exports.getWorkloadByEngineer= async (req, res) => {
  try {
    const tasks = await Task.aggregate([
      { $unwind: "$Executor" },
      {
        $group: {
          _id: "$Executor",
          taskCount: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ["$Status", "Completed"] }, 1, 0] } 
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      }
    ]);
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    next(err)}
};


exports.getEngineerTurnover = async (req, res) => {
  try {
    const projects = await Project.find({});
    let turnoverCount = 0;
    
    projects.forEach(project => {
      if (project.equipe && project.equipe.length > 1) {
        turnoverCount++;
      }
    });
    
    res.json({ 
      totalProjects: projects.length,
      projectsWithTurnover: turnoverCount,
      turnoverRate: ((turnoverCount / projects.length) * 100).toFixed(1)
    });
  } catch (err) {
    console.error(err);
    next(err)}
};


exports.getRiskyProjects= async (req, res) => {
  try {
    const riskyProjects = await Project.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "Project",
          as: "projectTasks"
        }
      },
      {
        $match: {
          "projectTasks.Status": { $in: ["Pending", "In Progress"] },
          status: "In Progress"
        }
      },
      {
        $project: {
          name: "$Projectname",
          taskCount: { $size: "$projectTasks" },
          lateTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: {
                  $and: [
                    { $ne: ["$$task.Status", "Completed"] },
                    { $lt: ["$$task.Deadline", new Date()] }
                  ]
                }
              }
            }
          },
          unassignedTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: {
                  $or: [
                    { $eq: ["$$task.Executor", []] },
                    { $eq: ["$$task.Executor", null] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $match: {
          $or: [
            { lateTasks: { $gt: 0 } },
            { unassignedTasks: { $gt: 0 } }
          ]
        }
      }
    ]);
    
    res.json(riskyProjects);
  } catch (err) {
    console.error(err);
    next(err)}
};
exports.getFilesPerProject= async (req, res) => {
  const stats = await Project.aggregate([
    {
      $project: {
        Projectname: 1,
        totalFiles: {
          $add: [
            { $size: { $ifNull: ["$requiredRatingFiles", []] } },
            "$providedRequiedFiles"
          ]
        }
      }
    }
  ]);

  res.json(stats);
};

exports.getAverageFilesPerProject= async (req, res) => {
  const stats = await Project.aggregate([
    {
      $project: {
        totalFiles: {
          $add: [
            { $size: { $ifNull: ["$requiredRatingFiles", []] } },
            "$providedRequiedFiles"
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgFiles: { $avg: "$totalFiles" }
      }
    }
  ]);

  res.json(stats[0] || { avgFiles: 0 });
};


exports.getAverageReturnsPerProject= async (req, res) => {
  const stats = await Project.aggregate([
    {
      $project: {
        Projectname: 1,
        totalRetours: {
          $add: [
            { $cond: [{ $gt: ["$note_Client", 0] }, 1, 0] },
            { $cond: [{ $gt: ["$note_Admin", 0] }, 1, 0] },
            { $size: { $ifNull: ["$note_equipe", []] } }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRetours: { $sum: "$totalRetours" },
        totalProjects: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        averageRetoursPerProject: {
          $cond: [
            { $eq: ["$totalProjects", 0] },
            0,
            { $divide: ["$totalRetours", "$totalProjects"] }
          ]
        }
      }
    }
  ]);

  res.json(stats[0] || { averageRetoursPerProject: 0 });
};

exports.getAverageReturnsPerClient= async (req, res) => {
  const stats = await Project.aggregate([
    {
      $project: {
        client: 1,
        totalRetours: {
          $add: [
            { $cond: [{ $gt: ["$note_Client", 0] }, 1, 0] },
            { $cond: [{ $gt: ["$note_Admin", 0] }, 1, 0] },
            { $size: { $ifNull: ["$note_equipe", []] } }
          ]
        }
      }
    },
    {
      $group: {
        _id: "$client",
        totalRetours: { $sum: "$totalRetours" },
        totalProjects: { $sum: 1 }
      }
    },
    {
      $project: {
        client: "$_id",
        averageRetours: {
          $cond: [
            { $eq: ["$totalProjects", 0] },
            0,
            { $divide: ["$totalRetours", "$totalProjects"] }
          ]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "client",
        foreignField: "_id",
        as: "clientInfo"
      }
    },
    { $unwind: "$clientInfo" },
    {
      $project: {
        clientName: "$clientInfo.fullName",
        averageRetours: 1
      }
    }
  ]);

  res.json(stats);
};


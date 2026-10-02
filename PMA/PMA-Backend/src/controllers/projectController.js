const Project = require("../models/project");
const User = require("../models/user");
const ProjectFile = require("../models/project_file");
const mailer_service = require("../config/mailer_config");
const ProjectRating = require("../models/projectRating.model");
const { findProjects, updateProjectAvailableFiles, getProjectsForCurrentAndLastYear, parseProjectEmail, extractProjectData } = require("../helpers/projects.helpers");
const { CalculateGlobalRatingForProject } = require("../helpers/rating.helpers");
const { createAndSendNotification } = require("../controllers/notification.controller");
const { NODE_ENV } = require("../config/config")
// -------------------- new methods ----------------

module.exports.uploadFile = async function (req, res) {
    if(!req.file || !req.file.filename){
        throw Error("Invalid file selection, please try again !")
    }
    await Project.findByIdAndUpdate(req.params.id, { $set: { [req.body.fileType]: req.file.filename } })
    return res.status(200).send({message : "file uploaded successfully", data : req.file.filename } );
};

module.exports.uploadMultipleFile = async function (req, res, next) {
    try {
        let files = [];
        let types = typeof(req.body.fileType) == "string" ? [req.body.fileType] : req.body.fileType;
        for (let i = 0; i < req.files.length; i++) {
            const element = req.files[i];
            files.push({type:  types[i], file : element.filename});
        }
        res_data = [];
        for (let i = 0; i < files.length; i++) {
            const element = files[i];
            const saved_file = await ProjectFile.create({
                project : req.params.id, 
                type : element.type, 
                file : element.file
            });
            res_data.push(saved_file);
        }
        //update the project note
        await updateProjectAvailableFiles(req.params.id);
        await CalculateGlobalRatingForProject(req.params.id);
        //send notification to admin for the new files
        const project = await Project.findById(req.params.id);
        await createAndSendNotification(
            `Files uploaded in project`, 
            `File uploaded in project : ${project.Projectname}, the new files of type : ${res_data.map(file => file.type).join(', ')}`, 
            ['admin'],
            req.params.id,
            'File',
            null
        );


        return res.status(200).send({message : "files uploaded successfully", data : res_data } );
    } catch (error) {
        next(error);
    }
};

module.exports.deleteFile = async (req, res, next)=>{
    try {
        const { fileType } = req.query
        const project = await Project.findById(req.params.id);
        project[fileType] = null
        await project.save();
        return res.status(200).send({ message : 'File deleted successfully' });
    } catch (error) {
        next(error)
    }
}

module.exports.configureFilesRatingConfig = async (req, res, next)=>{
    try {
        const requiredFiles = req.body.requiredFiles;
        if(!requiredFiles) throw Error("Invalid required files, please try again !");
        const project = await Project.findById(req.params.id);
        //so the configuration can be eanbled or disabled if no files are specified    
        if(requiredFiles.length != 0){
            project.requiredRatingFiles = requiredFiles; 
            project.hasFilesRatingConfig = true;
        }else{
            project.requiredRatingFiles = []; 
            project.hasFilesRatingConfig = false;
        }   
        await project.save();
        await CalculateGlobalRatingForProject(req.params.id);
        return res.status(200).send({ 
            message : 'Required files setup successfully', 
            data : { 
                requiredFiles : project.requiredRatingFiles, 
                hasFilesRatingConfig : project.hasFilesRatingConfig,
                projectId : project._id 
            } 
        });
    } catch (error) {
        next(error)
    }
}

module.exports.noteProject = async (req, res, next)=>{
    try {
        const { clientId, note } = req.body;
        const project = await Project.findById(req.params.id);
        if(project.client.toString() !== clientId){
            throw Error("Your'e not authorized to note this project");
        }
        project.note_Client = note;
        project.letterUploaded = true;
        await project.save();
        //update the project note
        await CalculateGlobalRatingForProject(project._id.toString());
        const { projects } = await findProjects({ id : project._id.toString() }, false);
        return res.status(200).send({ message : 'Note sent successfully', data : projects });
    } catch (error) {
        next(error)
    }
}

module.exports.shareFile = async function(req, res, next) {
    try {
        const { receiverEmail,fileName, projectName  } = req.body;
        const receiver = await User.findOne({ email : receiverEmail });
        const {projects} = await findProjects({ id : projectName }, false);
        if (!receiverEmail || !fileName  || !projectName) {
            throw Error("Erro happened while sending file");
        }
        if(NODE_ENV === 'production'){
            mailer_service.sendEmailWithTemplate(receiverEmail, 'Project file sharing', 'share_project_file', { name : receiver.fullName, fileName, projectName : projects.Projectname });
        }
        return res.status(200).send({message : 'File sent successfully'});
    } catch (error) {
        next(error)
    }
};

module.exports.createProject = async (req, res, next)=>{
    try {
        //set the project start date to midnight 00:00

        const new_project =  await Project.create({
            ...req.body, 
            dateDebut : new Date(req.body.dateDebut).setHours(0, 0, 0, 0),
            dateFin : new Date(req.body.dateFin).setHours(23, 59, 0, 0)
        });
        const tl = await User.findById(new_project.TeamLeader);
        
        const members = [tl];
        for (let user of new_project.equipe) {
            let fullUser = await User.findById(user._id);
            members.push(fullUser);  
        };
        //create a rating object for this project
        await ProjectRating.create({ project : new_project._id });
        //notify the team members in this project by mail and send notification
        createAndSendNotification(
            `New project created : ${ new_project.Projectname }`,
            `You have been added to a new project : ${ new_project.Projectname }`,
            members.map(user => user._id.toString()),
            new_project._id.toString(),
            "Project"
        );     
        createAndSendNotification(
            `New project has been created`,
            `Do not forget to set up the required files required for rationg for this porject: ${ new_project.Projectname }`,
            ['admin'],
            new_project._id.toString(),
            "Project"
        );    
        if(NODE_ENV === 'production'){
            mailer_service.sendEmailWithTemplate(tl.email, 'New project Created', 'project_creation_team_leader', { name : tl.fullName, projectName : new_project.Projectname })
        } 
        const { projects } = await findProjects({ id : new_project._id }, false);
        return res.status(200).send({ message : 'Project created successfully', data : projects })
    } catch (error) {
        next(error)
    }
}

module.exports.findAll = async (req, res, next) =>{
    try {
        const { projects, total } = await findProjects(req.query, true);
        return res.status(200).send({ message : 'Project retrieved successfully', data : { projects : projects, total } })
    } catch (error) {
        next(error)
    }
}

module.exports.findProjectUploads = async (req, res, next) =>{
    try {
        const { projects, total } = await findProjects(req.query, true);
        return res.status(200).send({ message : 'Project retrieved successfully', data : { projects, total } })
    } catch (error) {
        next(error)
    }
}

module.exports.findClientProjects = async (req, res, next) =>{
    try {
        let pending = 0;
        let completed = 0;
        let inProgress = 0;
        const { projects, total } = await findProjects({ client : req.params.id }, true);
        projects.forEach(p => {
            if(p.status == 'Completed') completed++;
            if(p.status == 'Pending') pending++;
            if(p.status == 'In Progress') inProgress++;
        });
        const data = {
            all : total,
            completed,
            pending,
            inProgress,
            projects
        }

        return res.status(200).send({ message : 'Projects retrieved successfully', data })
    } catch (error) {
        next(error)
    }
}
module.exports.findProjectsGroupedByStatus = async (req, res, next) =>{
    try {
        let pending = 0;
        let completed = 0;
        let inProgress = 0;
        let overdue = 0;

        pendingProjects = [];
        inProgressProjects = [];
        completedProjects = [];      
        let overdueProjects = [];

        const all = await findProjects({}, true);
        all.projects.forEach(p => {
            if(p.status == 'Completed') {
                completed++
                completedProjects.push(p)
            };
            if(p.status == 'Pending') {
                pending++;
                pendingProjects.push(p)
            };
            if(p.status == 'In Progress'){
                inProgress++;
                inProgressProjects.push(p)
            };
            if(new Date(p.closedAt) > new Date(p.dateFin)) {
                overdue++;
                overdueProjects.push(p)
            }
        });
        const data = {
            all : { total : all.total, projects : all.projects },
            pending : { total : pending, projects : pendingProjects },
            inProgress : { total : inProgress, projects : inProgressProjects },
            completed : { total : completed, projects : completedProjects },
            overdue : { total : overdue, projects : overdueProjects },
        }

        return res.status(200).send({ message : 'Projects retrieved successfully', data })
    } catch (error) {
        next(error)
    }
}

module.exports.getProjectForCurrentAndLastYear = async (req, res, next)=>{
    try {
        const projects = await getProjectsForCurrentAndLastYear();
        return res.status(200).send({ message : 'Projects retrieved successfully', data : projects })
    } catch (error) {
        next(error);
    }
}

module.exports.findTeamLeadersParticipations = async (req, res,next) => {
    try {
        const leaders = await User.find({ roles: { $in: ['Team Leader'] } }).select('-password -salt');
        const participations = [];
        for (let i = 0; i < leaders.length; i++) {
            const leader = leaders[i];
            const { projects, total } = await findProjects({ TeamLeader: leader }, true);
            
            participations.push({
                leader,
                participations: total
            });
        }
        return res.status(200).send({ message: 'Participations retrieved successfully', data: participations });
    } catch (error) {
        next(error);
    }
}
module.exports.findEngineersParticipations = async (req, res,next) => {
    try {
        const engineers = await User.find({ roles: { $in: ['Engineer'] } }).select('-password -salt');
        const participations = [];
        for (let i = 0; i < engineers.length; i++) {
            const engineer = engineers[i];
            const { projects, total } = await findProjects({ equipe: engineer._id.toString() }, true);
            
            participations.push({
                engineer,
                participations: total
            });
        }
        return res.status(200).send({ message: 'Participations retrieved successfully', data: participations });
    } catch (error) {
        next(error);
    }
}

module.exports.findById = async (req, res, next) =>{
    try {
        const { projects } = await findProjects({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Project retrieved successfully', data : projects })
    } catch (error) {
        next(error)
    }
}

module.exports.findEquipeByProject = async (req, res, next) =>{
    try {
        const { projects } = await findProjects({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Project retrieved successfully', data : [...projects.equipe, projects.TeamLeader] })
    } catch (error) {
        next(error)
    }
}

module.exports.updateProjectNew = async (req, res, next) =>{
    try {
        await Project.findByIdAndUpdate(req.params.id, {
            ...req.body, 
            dateDebut : new Date(req.body.dateDebut).setHours(0, 0, 0, 0),
            dateFin : new Date(req.body.dateFin).setHours(23, 59, 0, 0),
        });
        const { projects } = await findProjects({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Project updated successfully', data : projects })
    } catch (error) {
        next(error)
    }
}

module.exports.getMyTeams = async (req, res, next)=>{
    try {
        const { projects } = await findProjects(req.query, true);
        const team = projects.map(p => {
            return {
                project : {
                    _id : p._id,
                    Projectname : p.Projectname
                },
                team : p.equipe
            }
        })
        return res.status(200).send({ message : 'Project team retrieved successfully', data : team  })
    } catch (error) {
        next(error)
    }
}

module.exports.findMyClients = async (req, res, next)=>{
    try {
        let myClients = [];        
        const { projects } = await findProjects({ equipe: req.params.id }, true);        
        for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            
            if (!myClients.some(client => client.fullName === p.client.fullName)) {
                myClients.push(p.client);
            }
        }        
        return res.status(200).send({ 
            message: 'Clients retrieved successfully', 
            data: myClients 
        });
    } catch (error) {
        next(error);
    }
}

module.exports.findTeamLeaderClients = async (req, res, next)=>{
    try {      
        const { projects } = await findProjects({ TeamLeader: req.params.id }, true);
        const clients = [...new Map(projects.map(item => [item.client._id, item.client])).values()]
        return res.status(200).send({ 
            message: 'Clients retrieved successfully', 
            data: clients 
        });
    } catch (error) {
        next(error);
    }
}

module.exports.generateProjectFromText = async (req, res, next)=>{
    try {      
        const obj = await extractProjectData(req.body.text);
        return res.status(200).send({ 
            message: 'Project parsed successfully', 
            data: obj 
        });
    } catch (error) {
        next(error);
    }
}
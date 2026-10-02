const Project = require("../models/project");
const ProjectFile = require("../models/project_file");
const { findUsers } = require("../helpers/users.helpers");
const { SERP_API_KEY } = require("../config/config")

const axios = require("axios")

async function updateProjectAvailableFiles(projectId){
    const project = await Project.findById(projectId);
    if(project){
        const uploadedrequiredFiles = await ProjectFile.find({
            project: projectId,
            type: { $in: project.requiredRatingFiles.map(file => new RegExp(file, 'i')) }
        });
        const uploaded = [...new Set(uploadedrequiredFiles.map(e => e.type))];
        project.providedRequiedFiles = uploaded.length;
        await project.save();
        return uploaded.length;
    }
}

async function getProjectsForCurrentAndLastYear(){
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Get projects where startDate or deadline is in the current or last year
    const projects = await Project.find({
        $or: [
            { dateDebut: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } },
            { dateFin: { $gte: new Date(`${lastYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } }
        ]
    });
    const lastYearProjects = groupProjectsByMonth(projects, lastYear);
    const currentYearProjects = groupProjectsByMonth(projects, currentYear);
    return { current : currentYearProjects, last : lastYearProjects };
}

function groupProjectsByMonth(projects, year) {
    const months = Array(12).fill(0);

    for (const project of projects) {
        const startDate = new Date(project.dateDebut);
        if (startDate.getFullYear() == year) {
            months[startDate.getMonth()]++; // Increment the month count
        }
    }
    return months;
}
    

async function findProjects(filter, multiple){
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.TeamLeader) query.TeamLeader = filter.TeamLeader;
    if(filter.client) query.client = filter.client;
    if(filter.Projectname) query.Projectname = filter.Projectname;
    if(filter.status) query.status = filter.status;
    if(filter.type) query.type = { $regex : filter.type, $options : 'i' };
    if(filter.year) {
        const startOfYear = new Date(`${filter.year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${Number.parseInt(filter.year) + 1}-01-01T00:00:00.000Z`);
        query.dateDebut = { $gte : startOfYear, $lt : endOfYear }
    }
    //suppose roles are separated by a dash -
    if(filter.equipe) query.equipe = { $in : filter.equipe.split('-') };
    try {
        const request = multiple ? Project.find(query) : Project.findOne(query);
        const projects = await request
        .populate({
            path : 'TeamLeader',
            select : '-password -isEnabled'
        })
        .populate({
            path : 'equipe',
            select : '-password -isEnabled'
        })
        .populate({
            path : 'client',
            select : '-password -isEnabled'
        })
        .populate({
            path : 'rating',
            populate : [
                {
                    path : "memberToTeamLeaderRatings.member",
                    select : "-password -isEnabled"
                },
                {
                    path : "membersNotes.member",
                    select : "-password -isEnabled"
                }
            ],
        })
        .sort({
            createdAt : -1
        })
        const total = await Project.countDocuments(query);
        return { projects, total};
    } catch (error) {
        throw Error("Error white getting projects")
    }
}

async function extractProjectData(email) {
    const get = (label) => {
        const regex = new RegExp(`-\\s*${label}\\s*:\\s*(.*)`, "i");
        const match = email.match(regex);
        return match ? match[1].trim().replace(/,$/, "") : "";
    };

    const equipeRaw = get("Equipe");
    const equipe = equipeRaw
        ? equipeRaw.split(/et|,|;|\n/gi).map(n => n.trim()).filter(n => n.length > 0)
        : [];

    let parsedEquipe = [];
    let parsedTeamLeader = get("Team leader");
    if(parsedTeamLeader) {
        parsedTeamLeader = await findUsers({fullName : get("Team leader")}, false);
    }
    parsedTeamLeader = parsedTeamLeader.users;
    parsedEquipe = await Promise.all(equipe.map(name => findUsers({ fullName : name }, false)));
    parsedEquipe = parsedEquipe.map(u => u.users);
    let priorityValue = get("priorite");
    if(priorityValue.includes("moyenne") || priorityValue.includes("moyen")) priorityValue = "Medium";
    if(priorityValue.includes("low") || priorityValue.includes("faible")) priorityValue = "Low";
    if(priorityValue.includes("high") || priorityValue.includes("haut") ||priorityValue.includes("haute")) priorityValue = "High";
    let externalClients = [];
    let internalClients = [];
    
    const clientValue = get("client");
    if(clientValue){
        internalClients = await findUsers({ fullName : clientValue, roles : 'Client'}, true);
        internalClients = internalClients.users
    }
    // const searchResponse = await searchClientsData(clientValue);
    const parsed = {
        Projectname: get("Nom du projet"),
        TeamLeader: parsedTeamLeader,
        equipe: parsedEquipe,
        dateDebut: get("date debut"),
        dateFin: get("date fin"),
        client: clientValue,
        priority: priorityValue,
        type: get("type"),
        description: get("description"),
        internalClients : internalClients,
        externalClients :externalClients
    }
    return parsed;
}


async function searchClientsData(client){
    const url = `https://serpapi.com/search.json?q=${client}&location=Tunis,+Tunis+Governorate,+Tunisia&hl=ar&gl=tn&google_domain=google.tn&api_key=${SERP_API_KEY}`;
    const response = (await axios.get(url)).data.organic_results;
    console.log(response);
}

module.exports = {
    findProjects,
    updateProjectAvailableFiles,
    getProjectsForCurrentAndLastYear,
    extractProjectData,
    searchClientsData
}
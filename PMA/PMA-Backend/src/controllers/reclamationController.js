const Reclamation = require("../models/reclamations");
const Project = require("../models/project");

// ---------------------- new methods ----------------------------------

module.exports.findAll = async (req, res, next) =>{
    try {
        const { reclamations, total } = await findReclamations(req.query, true);
        return res.status(200).send({ message : 'Reclamations retrieved successfully', data : { reclamations, total } })
    } catch (error) {
        next(error)
    }
}

module.exports.findByTeamLeader = async (req, res, next) =>{
    try {
        let projects = await Project.find({ TeamLeader: req.params.userId });
        const projectIds = projects.map(p => p._id);
        const recs = await Reclamation.find({ project : { $in : projectIds } })
        .populate({
            path : 'project',
            populate : [
                { 
                    path : 'TeamLeader',
                    select : '-password -isEnabled'
                },
                { 
                    path : 'equipe',
                    select : '-password -isEnabled'
                }
            ]
        })
        .populate({
            path : 'client',
            select : '-password -isEnabled'
        })

        return res.status(200).send({ message : 'Reclamations retrieved successfully', data : {reclamations : recs, total : recs.length} })
    } catch (error) {
        next(error)
    }
}
module.exports.findById = async (req, res, next) =>{
    try {
        const { reclamations } = await findReclamations({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Reclamation retrieved successfully', data : reclamations })
    } catch (error) {
        next(error)
    }
}

module.exports.findByProject = async (req, res, next) =>{
    try {
        const { reclamations, total } = await findReclamations({ project : req.params.id }, true);
        return res.status(200).send({ message : 'Reclamation retrieved successfully', data : { reclamations, total } })
    } catch (error) {
        next(error)
    }
}

module.exports.addResponse = async (req, res, next) =>{
    try {
        const rec = await Reclamation.findById(req.params.id);
        rec.reponse = req.body.message;
        await rec.save();
        const { reclamations } = await findReclamations({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Response was sent successfully', data : reclamations })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async (req, res, next) =>{
    try {
        await Reclamation.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message : 'Reclamation deleted successfully', data : { _id : req.params.id } })
    } catch (error) {
        next(error)
    }
}

module.exports.update = async function (req, res, next) {
    try {
        const rec = await Reclamation.findByIdAndUpdate(req.params.id, { $set: req.body }, { new : true });
        const { reclamations } = await findReclamations({ id : rec._id }, false)
        return res.status(200).json({ message: "Reclamation updated successfully", data : reclamations });
    } catch (error) {
        next(error);
    }
}

module.exports.findClientReclamations = async (req, res, next) =>{
    try {
        let treated = 0;
        let pending = 0;
        let inTreatement = 0;
        const { reclamations, total } = await findReclamations({ client : req.params.id }, true);
        reclamations.forEach(p => {
            if(p.status == 'Treated') treated++;
            if(p.status == 'Pending') pending++;
            if(p.status == 'In Treatement') inTreatement++;
        });
        const data = {
            all : total,
            treated,
            pending,
            inTreatement,
            reclamations
        }
        return res.status(200).send({ message : 'Client reclamations retrieved successfully', data })
    } catch (error) {
        next(error)
    }
}

module.exports.findReclamationsOverview = async (req, res, next) =>{
    try {
        let treated = 0;
        let pending = 0;
        let inTreatement = 0;
        const { reclamations, total } = await findReclamations({}, true);
        reclamations.forEach(p => {
            if(p.status == 'Treated') treated++;
            if(p.status == 'Pending') pending++;
            if(p.status == 'In Treatement') inTreatement++;
        });
        const data = {
            all : total,
            treated,
            pending,
            inTreatement,
        }

        return res.status(200).send({ message : 'Reclamations overview retrieved successfully', data })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

module.exports.create = async function (req, res, next) {
    const generatedNumbers = new Set();
    do {
        code = Math.floor(1000 + Math.random() * 9000);
    } while (generatedNumbers.has(code));
    
    generatedNumbers.add(code);

    try {
        let reclamation = new Reclamation({
            Title: req.body.Title,
            CodeRec: "RC" + code,
            Comment: req.body.Comment,
            Type_Reclamation: req.body.Type_Reclamation,
            Addeddate: new Date(),
            client: req.body.client,
            project: req.body.project,
            status: req.body.status
        });
        const saved_rec = await reclamation.save();
        const { reclamations } = await findReclamations({ _id : saved_rec._id }, false)
        return res.status(200).send({ message : "Reclamation saved successfully", data : reclamations });
    } catch (error) {
        next(Error("Error while saving reclamation"))
    }
};


// global method
async function findReclamations(filter, multiple){
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.project) query.project = filter.project;
    if(filter.projects) query.projects = { $in : filter.projects.split('-') };
    if(filter.client) query.client = filter.client;
    //suppose roles are separated by a dash -
    if(filter.equipe) query.equipe = { $in : filter.equipe.split('-') };
    try {
        const request = multiple ? Reclamation.find(query) : Reclamation.findOne(query);
        const reclamations = await request
        .populate({
            path : 'project',
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
            path : 'client',
            select : '-password -isEnabled'
        })
        const total = await Reclamation.countDocuments(query);
        return { reclamations, total};
    } catch (error) {
        console.log(error)
      throw Error("Error white getting reclamations")
    }
  }
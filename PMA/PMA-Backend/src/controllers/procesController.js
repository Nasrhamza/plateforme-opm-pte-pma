const ProcesV = require('../models/procesV');

// ---------------------- new methods ----------------------------------

module.exports.findAll = async (req, res, next) =>{
    try {
        const { proces, total } = await findProces(req.query, true);
        return res.status(200).send({ message : 'Proces retrieved successfully', data : { proces, total } })
    } catch (error) {
        next(error)
    }
}


module.exports.findById = async (req, res, next) =>{
    try {
        const { proces } = await findProces({ id : req.params.id }, false);
        return res.status(200).send({ message : 'Proces retrieved successfully', data : proces })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async (req, res, next) =>{
    try {
        await ProcesV.findByIdAndDelete(req.params.id);
        return res.status(200).send({ message : 'Proces deleted successfully', data : { _id : req.params.id } })
    } catch (error) {
        next(error)
    }
}

module.exports.update = async function (req, res, next) {
    try {
        const parsedEquipe = typeof req.body.equipe == "string" ? JSON.parse(req.body.equipe) : req.body.equipe;
        const p = await ProcesV.findByIdAndUpdate(req.params.id, { $set: {...req.body, equipe : parsedEquipe } }, { new : true });
        const { proces } = await findProces({ id : p._id }, false)
        return res.status(200).json({ message: "Proces updated successfully", data : proces });
    } catch (error) {
        next(Error("Error while updating proces"));
    }

}

module.exports.create = async function (req, res, next) {
    try {
        const parsedEquipe = typeof req.body.equipe == "string" ? JSON.parse(req.body.equipe) : req.body.equipe;
        let procesv = await ProcesV.create({...req.body, equipe : parsedEquipe });
        const { proces } = await findProces({ id : procesv._id });
        return res.status(200).send({ message : "Process verbal added successfully", data : proces });
    } catch (error) {
        next(error)
    }
}


// global method
async function findProces(filter, multiple){
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.Project) query.Project = filter.Project;
    if(filter.Titre) query.Titre = { $regex : filter.Titre, $options : 'i' };
    if(filter.Sender) query.Sender = filter.Sender;
    //suppose roles are separated by a dash -
    if(filter.equipe) query.equipe = { $in : filter.equipe.split('-') };
    try {
        const request = multiple ? ProcesV.find(query) : ProcesV.findOne(query);
        const proces = await request
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
            path : 'equipe',
            select : '-password -isEnabled'
        })
        .populate({
            path : 'Sender',
            select : '-password -isEnabled'
        })
        const total = await ProcesV.countDocuments(query);
        return { proces, total};
    } catch (error) {
      throw Error("Error white getting proces v")
    }
  }

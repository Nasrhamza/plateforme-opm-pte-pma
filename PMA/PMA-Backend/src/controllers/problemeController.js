const Probleme = require("../models/probleme")

// ---------------------- new methods -------------------

module.exports.findAll = async (req, res, next)=>{
    try {
        const { risks, total } = await findRisks(req.query, true);
        return res.status(200).send({ message :  'Risks retrieved successfully', data : { total, risks } })
    } catch (error) {
        next(error)
    }
}
module.exports.findById = async (req, res, next)=>{
    try {
        const { risks } = await findRisks({ id : req.params.id }, false);
        return res.status(200).send({ message :  'Risk retrieved successfully', data : risks })
    } catch (error) {
        next(error)
    }
}

module.exports.update = async (req, res, next)=>{
    try {
        const risk = await Probleme.findByIdAndUpdate(req.params.id, { $set : req.body }, { new : true });
        const { risks } = await findRisks({ id : risk.id }, false);
        return res.status(200).send({ message :  'Risk updated successfully', data : risks })
    } catch (error) {
        next(error)
    }
}

module.exports.create = async (req, res, next)=>{
    try {
        const risk = await Probleme.create(req.body);
        const { risks } = await findRisks({ id : risk._id }, false);
        return res.status(200).send({ message :  'Risk created successfully', data : risks })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async function(req, res) {
    try {
        await Probleme.findByIdAndRemove({ _id: req.params.id });
        return res.status(200).json({ message: "Risk deleted successfully", data : { _id : req.params.id } })
    } catch (error) {
        next(error)
    }
}
// global method
async function findRisks(filter, multiple){
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.project) query.project = filter.project;
    if(filter.user) query.user = filter.user;
    try {
        const request = multiple ? Probleme.find(query) : Probleme.findOne(query);
        const risks = await request
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
            path : 'user',
            select : '-password -isEnabled'
        })
        const total = await Probleme.countDocuments(query);
        return { risks, total};
    } catch (error) {
      throw Error("Error white getting risks")
    }
  }
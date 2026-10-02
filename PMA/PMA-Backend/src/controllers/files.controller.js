const ProjectFile = require("../models/project_file");
const { CalculateGlobalRatingForProject } = require("../helpers/rating.helpers");
const { updateProjectAvailableFiles } = require("../helpers/projects.helpers");
// ---------------------- new methods ----------------------------------

module.exports.findAll = async (req, res, next) =>{
    try {
        const { files, total } = await findFiles(req.query, true);
        return res.status(200).send({ message : 'Files retrieved successfully', data : { files, total } })
    } catch (error) {
        next(error)
    }
}


module.exports.findById = async (req, res, next) =>{
    try {
        const { files } = await findFiles({ id : req.params.id }, false);
        return res.status(200).send({ message : 'File retrieved successfully', data : files })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async (req, res, next) =>{
    try {
        const file = await ProjectFile.findById(req.params.id);
        if(!file){
            throw Error("File not found");
        };
        await ProjectFile.findByIdAndDelete(req.params.id);
        await CalculateGlobalRatingForProject(file.project._id.toString());
        const providedFiles = await updateProjectAvailableFiles(file.project._id.toString());
        return res.status(200).send({ message : 'File deleted successfully', data : { _id : req.params.id, providedFiles } })
    } catch (error) {
        next(error)
    }
}
// global method
async function findFiles(filter, multiple){ 
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.type) query.type = { $regex : filter.type, $options : 'i' };
    if(filter.project) query.project = filter.project;
    try {
        const request = multiple ? 
        ProjectFile.find(query): 
        ProjectFile.findOne(query);
        const files = await request
        .populate({
            path: 'project',
            populate: [
                {
                    path: 'client',
                    select: '-password -isEnabled'
                },
                {
                    path: 'TeamLeader',
                    select: '-password -isEnabled'
                }
            ]
        });
        const total = await ProjectFile.countDocuments(query);
        return { files, total};
    } catch (error) {
      throw Error("Error white getting files")
    }
  }

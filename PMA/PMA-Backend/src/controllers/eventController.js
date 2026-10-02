const Event = require("../models/event");

// --------------------------- new methods ---------------------------------

module.exports.findAll = async (req, res, next)=>{
    try {
        const { events, total } = await findEvents(req.query, true);
        return res.status(200).send({ message :  'Events retrieved successfully', data : { total, events } })
    } catch (error) {
        next(error)
    }
}

module.exports.create = async (req, res, next)=>{
    try {
        const new_event = await  Event.create(req.body);
        const { events } = await findEvents({ id : new_event._id }, false);
        return res.status(200).send({ message :  'Event created successfully', data : events })
    } catch (error) {
        next(error)
    }
}

module.exports.update = async function(req, res) {
    try {
        await Event.findByIdAndUpdate(req.params.id, { $set: req.body });
        const { events } = await findEvents({ id : req.params.id }, false);
        return res.status(200).json({ message: "Event Updated successfully!", data : events });
    } catch (error) {
        next(error) 
    }
}
module.exports.findById = async (req, res, next)=>{
    try {
        const { events } = await findEvents({ id : req.params.id }, false);
        return res.status(200).send({ message :  'Event retrieved successfully', data : events })
    } catch (error) {
        next(error)
    }
}

module.exports.delete = async function(req, res) {
    try {
        await Event.findByIdAndRemove({ _id: req.params.id });
        return res.status(200).json({ message: "Event deleted successfully", data : { _id : req.params.id } })
    } catch (error) {
        next(error)
    }
}

// global method
async function findEvents(filter, multiple){
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.user) query.user = filter.user;
    try {
        const request = multiple ? Event.find(query) : Event.findOne(query);
        const events = await request
        .populate({
            path : 'user',
            select : '-password -isEnabled'
        })
        const total = await Event.countDocuments(query);
        return { events, total};
    } catch (error) {
      throw Error("Error white getting events")
    }
  }
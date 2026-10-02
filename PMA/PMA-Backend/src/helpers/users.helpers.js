const User = require("../models/user");

async function findUsers (filter, multiple) {
    let query = {};
    if(filter.id) query._id = filter.id;
    if(filter.email) query.email = filter.email;
    if(filter.fullName) query.fullName = { $regex : filter.fullName, $options : "i" };
    //suppose roles are separated by a dash -
    if(filter.roles) query.roles = { $in : filter.roles.split('-') };
    if(filter.isEnabled == undefined){
        query.isEnabled = true
    }
    if(filter.enabled === 'true'){
        query.isEnabled = true
    }
    if(filter.enabled === 'false'){
        query.isEnabled = false
    }
    try {
        const request = multiple ? User.find(query) : User.findOne(query);
        const users = await request
        .select("-password -isEnabled");
        const total = await User.countDocuments(query);
        return { users : users, total : total };
    } catch (error) {
        throw Error(error)
    }
}

module.exports = {
    findUsers
}

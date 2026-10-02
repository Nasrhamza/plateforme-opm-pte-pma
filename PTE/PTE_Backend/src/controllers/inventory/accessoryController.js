const { ObjectId } = require("mongodb");
const Accessory = require("../../models/inventory/accessory_type");


module.exports.addAccessory = async function (req,res,next){ 
    const body = req.body.name
    try {
        // if(body ===''){
        //     return res.status(400).json({message: "Name is required"});
        // }
        const accessory_type = await Accessory.create({
            name: req.body.name,
            brand : req.body.brand,
            model : req.body.model,
            serial_number : req.body.serial_number,
            user : req.body.user
        });
        res.status(201).json({
            message: "Accessory added successfully",
            data: accessory_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getAllAccessories = async function (req,res,next){ 
    try {
        const accessory_types = await Accessory.find({})
        res.status(200).json({
            message: "Accessories fetched successfully",
            data: accessory_types
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getAccessoryById = async function (req,res,next){ 
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const accessory_type = await Accessory.findById(ID);
        res.status(200).json({
            message: "Accessory fetched successfully",
            data: accessory_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.getUserAccessories = async function (req,res,next){ 
    const userID = req.params.id
    if (!ObjectId.isValid(userID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const accessory_type = await Accessory.find({user : userID})
        .populate({
            path: 'user',
            select: '-password -salt'
        })
        res.status(200).json({
            message: "Accessory fetched successfully",
            data: accessory_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.deleteAccessory = async function (req,res,next){ 
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
        const accessory_type = await Accessory.findByIdAndDelete(ID);
        res.status(200).json({
            message: "Accessory deleted successfully",
            data: accessory_type
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.forwardAccessory = async function (req,res,next){ 
    const ID = req.params.id
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
       await Accessory.findByIdAndUpdate(ID,{user:req.body.user},{new : true});
        const updatedAccessory = await Accessory.findById(ID)
        .populate({
            path: 'user',
            select: '-password -salt'
        })
        res.status(200).json({
            message: "Accessory Forwaded successfully",
            data: updatedAccessory
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
module.exports.editAccessory = async function (req,res,next){ 
    const ID = req.params.id
    const body = {...req.body}
    if (!ObjectId.isValid(ID)) {
        return res.status(404).json("ID is not valid");
    }
    try {
       await Accessory.findByIdAndUpdate(ID,body,{new : true});
        const updatedAccessory = await Accessory.findById(ID)
        .populate({
            path: 'user',
            select: '-password -salt'
        })
        res.status(200).json({
            message: "Accessory updated successfully",
            data: updatedAccessory
        });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}


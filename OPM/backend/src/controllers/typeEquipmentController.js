const TypeEquipment = require('../models/typeEquipmentModel');
const File = require('../models/fileModel');
const { SERVER_URL } = require("../config/config");


exports.createTypeEquipment = async (req, res) => {
    try {
        const typeEquipment = new TypeEquipment(req.body);
        const files = req.files[0];

        // Create and save the file document
        const newFile = new File({
            fileName: files.filename,
            path: SERVER_URL + files.destination + '/' + files.filename,
            title: files.originalname.toString(),
        });
        await newFile.save();

        // Assign the file ID to the typeEquipment's logo field and save it
        typeEquipment.logo = newFile._id.toString();
        await typeEquipment.save();

        // Populate the logo field in the response
        const populatedTypeEquipment = await TypeEquipment.findById(typeEquipment._id).populate('logo');

        res.status(200).json({ err: false, message: "Successful operation!", rows: populatedTypeEquipment });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};


exports.updateTypeEquipment = async (req, res) => {
    try {
        const { _id, typeName, typeEquip } = req.body;
        const updatedTypeEquipment = await TypeEquipment.findByIdAndUpdate(
            { _id },
            { typeName, typeEquip },
            { new: true }
        ).populate('logo')
        .populate('listProblems');
        if (!updatedTypeEquipment) {
            return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: updatedTypeEquipment });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};


exports.deleteTypeEquipment = async (req, res) => {
    try {
        const typeEquipment = await TypeEquipment.findOneAndDelete({ _id: req.body._id });
        if (!typeEquipment) {
            return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: typeEquipment });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};
exports.getAllTypeEquipment = async (req, res) => {
    try {
        const typeEquipment = await TypeEquipment.find()
            .populate('listProblems')
            .populate({
                path: 'logo',
                model: 'File',
            });
        res.status(200).json({ err: false, message: "Successful operation !", rows: typeEquipment });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

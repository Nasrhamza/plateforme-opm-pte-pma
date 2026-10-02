const Problem = require('../models/problemModel');
const TypeEquipment = require('../models/typeEquipmentModel');

exports.createProblem = async (req, res) => {
    try {
        const problemData = { ...req.body };

        const problem = new Problem(problemData);
        await problem.save();

        const typeEquipment = await TypeEquipment.findById(req.body.typeEquipmentId); // Adjust key if necessary
        if (!typeEquipment) {
            return res.status(404).json({ err: true, message: "TypeEquipment not found" });
        }

        typeEquipment.listProblems.push(problem._id);
        await typeEquipment.save();

        res.status(200).json({ err: false, message: "Successful operation!", rows: problem, });
    } catch (error) {
        console.error("Error creating problem:", error);
        if (error.code === 11000) {
            return res.status(400).json({
                err: true, message: "Duplicate key error: A problem with the same ID already exists.",
            });
        }
        res.status(500).json({ err: true, message: error.message });
    }
};


exports.updateProblem = async (req, res) => {
    try {
        const { _id, nomProblem, description } = req.body;
        const updatedProblem = await Problem.findByIdAndUpdate(
            { _id },
            { nomProblem, description },
            { new: true }
        );
        if (!updatedProblem) {
            return res.status(404).json({ err: true, message: "No problem found ! " });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: updatedProblem });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.body._id);
        if (!problem) {
            return res.status(404).json({ err: true, message: "No problem found ! " });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: problem });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find()
        if (!problems) {
            return res.status(404).json({ err: true, message: "No problem found ! " });
        }
        res.status(200).json({ err: false, message: "Successful operation!", rows: problems });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};


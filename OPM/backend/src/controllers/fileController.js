const File = require('../models/fileModel');
const path = require('path');

exports.createFile = async (req, res) => {
  try {
    const file = File(req.body);
    await file.save();
    res.status(200).json({err: false, message: "Successful operation !", rows: file});
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

// Get all files
exports.getAllFiles = async (req, res) => {
  try {
    const file = await File.find();
    res.status(200).json({err: false, message: "Successful operation !", rows: file});
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.downloadFile = async (req, res) => {
  try {
    const token = req.query.token;
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ err: true, message: 'File not found!' });
    }

    const filePath = path.join(__dirname, file.path); // Adjust the path as necessary
    res.download(filePath, file.fileName); // Send the file to the client
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

// Get a single file
exports.getFileById = async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
      }
      res.status(200).json({err: false, message: "Successful operation !", rows: file});
    } catch (err) {
      res.status(500).json({ err: true, message: error.message });
    }
  };
  
  exports.countFilesByClientId = async (req, res) => {
    const clientId = req.params.id;
    try {
      const count = await File.countDocuments({ clientId });
      res.status(200).json({err: false, message: "Successful operation !", rows: count, clientId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ err: true, message: error.message });
    }
  };

// Update a user still working on it username
exports.updateFile = async (req, res) => {
  try {
    const { _id, path, fileName } = req.body;
    const updatedFile = await File.findByIdAndUpdate(
       _id ,
      { path, fileName },
      { new: true }
    );
    if (!updatedFile) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({err: false, message: "Successful operation !", rows: updatedFile });
  } catch (err) {
    console.error(error);
    res.status(500).json({ err: true, message: error.message });
  }
};




// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.body._id);
    if (!file) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({err: false, message: "Successful operation !", rows: file});
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};

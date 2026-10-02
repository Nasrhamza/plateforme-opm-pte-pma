const Folder = require('../models/folderModel');
const File = require('../models/fileModel');
const Site = require('../models/siteModel');
const Counter = require("../models/counterModel");
const Vistepreventive = require('../models/vistepreventiveModel');
const Contract = require('../models/contractModel');
const { SERVER_URL } = require("../config/config");


exports.createFolder = async (req, res) => {
  try {
    const { name, colorfoldr, type } = req.body;
    const existingFolder = await Folder.findOne({ name });
    if (existingFolder) {
      return res.status(400).json({ err: true, message: "Folder name already exists!" });
    }
    const folder = new Folder({ name, colorfoldr, type });
    const files = req.files[0];
    const newFile = new File({
      fileName: files.filename,
      path: `${SERVER_URL}${files.destination}/${files.filename}`,
      title: files.originalname.toString(),
    });

    await newFile.save();
    folder.logo = newFile._id.toString();

    await folder.save();
    res.status(200).json({ err: false, message: "Successful operation!", rows: folder });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};


exports.updateFolder = async (req, res) => {
  try {
    const { _id, name, colorfoldr } = req.body;
    if (!_id) {
      return res.status(400).json({ err: true, message: "Folder ID is required." });
    }
    const updatedFolder = await Folder.findByIdAndUpdate(
      _id,
      { name, colorfoldr },
      { new: true }
    );
    if (!updatedFolder) {
      return res.status(404).json({ err: true, message: "No folder found or operation failed." });
    }
    if (req.files && req.files.length > 0) {
      const fileData = req.files[0];
      const newFile = new File({
        fileName: fileData.filename,
        path: `${SERVER_URL}${fileData.destination}/${fileData.filename}`,
        title: fileData.originalname,
      });
      await newFile.save();
      updatedFolder.logo = newFile._id.toString();
      await updatedFolder.save();
    }
    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: updatedFolder,
    });
  } catch (error) {
    console.error("Error in updateFolder:", error);
    res.status(500).json({
      err: true,
      message: "An error occurred. Please try again later.",
      details: error.message,
    });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.body._id);
    if (!folder) {
      return res.status(404).json({ err: true, message: "No folder found!" });
    }

    await Contract.deleteMany({ _id: { $in: folder.contractId } });

    await Folder.findByIdAndDelete(req.body._id);

    res.status(200).json({ err: false, message: "Successful operation!", rows: folder });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params._id)
      .populate({
        path: 'logo',
        model: 'File',
      })
    if (!folder) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: folder });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find()
      .populate('contractId')
      .populate({
        path: 'logo',
        model: 'File',
      })

    const modifiedFolders = folders.map(folder => {
      const contractCount = folder.contractId ? folder.contractId.length : 0;
      return {
        ...folder.toObject(),
        nbrContrat: contractCount
      };
    });
    res.status(200).json({ err: false, message: "Successful operation !", rows: modifiedFolders });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateSite = async (req, res) => {
  try {
    const { _id, nomSite, longitude, latitude, adress } = req.body;
    const updateSite = await Site.findByIdAndUpdate(
      { _id },
      { nomSite, longitude, latitude, adress },
      { new: true }
    );
    if (!updateSite) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateSite });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getListSiteBayFolder = async (req, res) => {
  try {
    const folders = await Folder.findById(req.params._id).populate('listSite');
    const listSites = folders.listSite
    res.status(200).json({ err: false, message: "Successful operation !", rows: listSites });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getContractsByFolderId = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params._id).exec();
    if (!folder) {
      return res.status(404).json({ err: true, message: "Folder not found" });
    }
    const contractIds = folder.contractId;
    const ListContract = [];
    await Promise.all(contractIds.map(async contractId => {
      const contract = await Contract.findById(contractId)
        .populate('listOfFiles')
        .populate({
          path: 'technicians',
          model: 'Technicien',
        })

        .populate({
          path: 'clients',
          model: 'Client',
        })
        .populate({
          path: 'Vistepreventive',
          populate: [
            { path: 'siteID', model: 'Site' },
            { path: 'technicians', model: 'Technicien' }
          ]
        })

        .populate({
          path: 'listOfFiles',
          model: 'File',
        });

      if (contract) {
        ListContract.push(contract);
      }
    }));

    if (ListContract.length === 0) {
      return res.status(200).json({ err: false, message: "No contracts found for this folder", rows: ListContract });
    }

    res.status(200).json({ err: false, message: "Contracts found for the folder", rows: ListContract });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.addFile = async (req, res) => {
  try {
    const files = req.files; // Get the array of uploaded files
    const uploadedFiles = [];

    for (const file of files) {
      const newFile = File({
        fileName: file.filename,
        path: SERVER_URL + file.destination + '/' + file.filename,
        title: file.originalname.toString(),
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }
    const folder = await Folder.findOneAndUpdate(
      { clientId: req.body.clientId },
      { $push: { listOfFiles: uploadedFiles } },
      { new: true }
    );
    res.status(200).json({
      err: false,
      message: "Successful operation !",
      rows: [folder, files.map(file => file.originalname)]
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.removeFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.body.fileId);
    if (!file) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const folder = await Folder.findOneAndUpdate(
      { clientId: req.body.clientId },
      { $pull: { listOfFiles: req.body.fileId } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: folder });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getFilesByclientId = async (req, res) => {
  const clientId = req.params.id;
  try {
    const folder = await Folder.findOne({ clientId }).populate('listOfFiles');
    if (!folder) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: folder.listOfFiles });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.countFilesByClientId = async (req, res) => {
  const clientId = req.params.id;

  try {
    const folder = await Folder.findOne({ clientId });
    const count = folder.listOfFiles.length;
    res.status(200).json({ err: false, message: "Successful operation !", rows: { count, clientId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: true, message: error.message });
  }
};


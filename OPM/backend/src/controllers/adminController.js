const { SERVER_URL } = require('../config/config');
const Admin = require('../models/adminModel'); // Adjust the path as needed
const File = require('../models/fileModel');

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Create the admin user
    const admin = new Admin({
      email,
      password,
      firstName,
      lastName
    });

    await admin.save();
    res.status(201).json({ message: 'Admin user created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error });
  }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).populate('image');
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin', error });
  }
};

// Update admin by ID
exports.updateAdmin = async (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber } = req.body;
    const admin = await Admin.findById(req.params.id).populate('image');
    const image = req.file;
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    // Update fields
    if (email) admin.email = email;
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phoneNumber) admin.phoneNumber = phoneNumber;

    if (image) {
      // Create a new file for the uploaded image
      const newFile = new File({
        fileName: image.filename,
        path: `${SERVER_URL}uploads/${image.filename}`,
        title: image.originalname
      });
      await newFile.save();
      admin.image = newFile._id;
    }
    await admin.save();
    const payload = await Admin.findById(req.params.id).populate('image');
    res.status(200).json({ message: 'Admin updated successfully', data: payload });
  } catch (error) {
    res.status(500).json({ message: 'Error updating admin', error });
  }
};

// Delete admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    await admin.remove();
    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {

    res.status(500).json({ message: 'Error deleting admin', error });
  }
};

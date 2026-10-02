const { SERVER_URL } = require('../config/config');
const Admin = require('../models/adminModel');
const Commercial = require('../models/commercialModel');
const File = require('../models/fileModel');
const Folder = require('../models/folderModel');
const Technicien = require('../models/technicienModel');
const Technician = require('../models/technicienModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const defaultImagePath = `${SERVER_URL}uploads/noprofilepic22.png`;



exports.createUser = async (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber, role, contract } = req.body;
    let Model;

    if (role === 'technician') {
      Model = Technicien;
    } else if (role === 'commercial') {
      Model = Commercial;
    } else {
      Model = User;
    }
    // Check if user with provided email already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    // Set up default image if no image is provided in the request
    const newFile = new File({
      fileName: 'noprofilepic22.png',
      path: defaultImagePath,
      title: 'Default Profile Picture'
    });
    const password = `Connect@${new Date().getFullYear()}`;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await newFile.save();
    // Create new user with default image
    const user = new Model({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      authority: role,
      valid: true,
      image: newFile._id // Reference the default image file ID
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Change Password Controller Function
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, rolepassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    let Model
    if (rolepassword === 'admin') {
      Model = Admin
    } else Model = User
    // Find the user by ID (assumed to be passed in the route parameters)
    const user = await Model.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Send success response
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single user 
exports.getUserById = async (req, res,) => {
  try {
    const user = await User.findById(req.params.id).populate('image');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};
exports.getListCommercial = async (req, res) => {
  try {
    const commercials = await User.find({ authority: 'commercial' }).populate('image');
    if (!commercials || commercials.length === 0) {
      return res.status(404).json({ message: 'No commercials found' });
    }
    res.status(200).json({ message: 'Succeffully', rows: commercials });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching commercials', error });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { valid: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted', user });
  } catch (err) {
    next(err);
  }
};

exports.updateStatUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.body._id },
      { valid: req.body.valid },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User status changed', user });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;
    const user = await User.findById(req.params.id).populate('image');
    const image = req.file;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    // Update profile picture if a new one is uploaded
    if (image) {
      // Create a new file for the uploaded image
      const newFile = new File({
        fileName: image.filename,
        path: `${SERVER_URL}uploads/${image.filename}`,
        title: image.originalname
      });
      await newFile.save();
      user.image = newFile._id;
    }
    await user.save();

    // Fetch the updated technician with populated image
    const payload = await User.findById(req.params.id).populate('image');
    res.status(200).json({ message: 'Account updated successfully', data: payload });

  } catch (error) {
    res.status(500).json({ message: 'Error updating User', error });
  }
};
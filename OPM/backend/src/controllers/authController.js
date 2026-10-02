const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Technicien = require('../models/technicienModel');
const Contract = require('../models/contractModel');
const Folder = require('../models/folderModel');
const tokenGen = require("../middlewares/tokenMiddleware");
const File = require('../models/fileModel');
const { SERVER_URL } = require("../config/config");
const { sendMail, sendEmailWithTemplate } = require("../controllers/emailController");
const jwt = require('jsonwebtoken');



exports.register = async (req, res) => {
  let { firstName, lastName, email, password, authority, phoneNumber, permisConduire, passeport, expiredAt } = req.body;
  let Model;

  if (authority === 'technician') {
    Model = Technicien;
  } else {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    // Always store email in lowercase
    email = email.toLowerCase();

    // Check if the technician already exists
    const userExists = await Model.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Technician already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile picture upload
    const profilePictureFile = req.files['profilePicture'] ? req.files['profilePicture'][0] : null;
    const profilePicture = profilePictureFile ? new File({
      fileName: profilePictureFile.filename,
      path: SERVER_URL + profilePictureFile.destination + '/' + profilePictureFile.filename,
      title: profilePictureFile.originalname.toString(),
    }) : null;

    // Handle signature upload
    const signatureFile = req.files['signature'] ? req.files['signature'][0] : null;
    const signature = signatureFile ? new File({
      fileName: signatureFile.filename,
      path: SERVER_URL + signatureFile.destination + '/' + signatureFile.filename,
      title: signatureFile.originalname.toString(),
    }) : null;

    if (profilePicture) await profilePicture.save();
    if (signature) await signature.save();

    // Create the technician object
    const newTechnician = new Model({
      ...req.body,
      email, // ensure lowercase is saved
      phoneNumber,
      permisConduire,
      expiredAt,
      passeport,
      password: hashedPassword,
      image: profilePicture ? profilePicture._id.toString() : null,
      signature: signature ? signature._id.toString() : null,
    });

    // Save the technician
    await newTechnician.save();

    // **Send Response First**
    res.status(201).json({ message: 'Technician created successfully' });

    // **Perform Email Sending Asynchronously**
    (async () => {
      try {
        const admins = await Admin.find({ authority: 'admin' });
        const adminsToNotify = admins.map(admin => admin._id.toString());

        const emailSubject = `New Technician Registration`;
        const emailTemplate = 'userConfirmation';
        const emailVariables = {
          email,
          fullName: `${firstName} ${lastName}`,
          year: new Date().getFullYear(),
        };

        await sendEmailWithTemplate(email, 'Registration in Progress', 'techRegistration', emailVariables);

        await Promise.all(
          adminsToNotify.map(async userId => {
            const user = await Admin.findById(userId);
            if (user?.email) {
              try {
                await sendEmailWithTemplate(user.email, emailSubject, emailTemplate, emailVariables);
              } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err);
              }
            }
          })
        );
      } catch (error) {
        console.error('Email sending failed:', error);
      }
    })();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    var user = await Admin.findOne({ email: email.toLowerCase() }).populate('image');
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() })
        .populate('image')
        .populate('signature')
        .populate('listEquipment')
        .populate('listEquipmentSoft')
        ;
      if (!user) {
        return res.status(404).json({ message: 'Invalid email or password' });
      }
    }
    if (user.valid == false) {
      return res.status(404).json({ message: 'account in progress' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(404).json({ message: 'Invalid email or password' });
    }
    user = user.toObject(); // Convert to plain object if it's a mongoose document
    delete user.password;
    var contract;
    var folder;
    var nameFolder = null
    if (user.authority == "client") {
      contract = await Contract.findById(user.contractId);
      folder = await Folder.find({ clientId: user._id })
      nameFolder = folder[0].name
    }
    const payload = { user, contract, folder: nameFolder };
    const { accessToken, refreshToken } = await tokenGen.generateToken(user);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).json({ message: 'Login successful', payload, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
};
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const adminUser = await Admin.findOne({ email: email.toLowerCase() });
    const normalUser = await User.findOne({ email: email.toLowerCase() });

    const user = adminUser || normalUser;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token using the middleware function
    const resetToken = tokenGen.generateResetToken(user._id, user.email);

    // Send password reset email
    const resetLink = `${process.env.FRONT_SERVER_URL}/auth/reset-password?token=${resetToken}`;

    await sendEmailWithTemplate(user.email, 'Password Reset Request', 'passwordReset', {
      fullName: `${user.firstName} ${user.lastName}`,
      resetLink,
      year: new Date().getFullYear(),
    });

    res.status(200).json({ message: 'Password reset link sent to email.' });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY);
    if (!decoded) return res.status(400).json({ message: 'Invalid or expired token' });

    // Find user by email
    const user = await Admin.findOne({ email: decoded.email }) || await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};
exports.verify = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw ("invalid token");
    }
    const token = req.headers.authorization.split(' ')[1];
    const { tokenDetails, message, error } = await tokenGen.verifyToken(token);
    if (error) {
      res.status(500).json({ message: message });
      return;
    }
    res.setHeader('Authorization', `Bearer ${tokenDetails.AccessToken}`);
    next();
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { message } = await tokenGen.deleteToken(token);
    res.status(200).json({ err: false, message: "Successful operation !" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
exports.updateEtatUsers = async (req, res) => {
  try {
    const { _id, valid } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      { _id },
      { valid },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updatedUser });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
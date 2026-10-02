const { ObjectId } = require("mongodb");
const User = require("../models/user");
const Roles = require("../models/roles");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ForgetPassword = require("../models/forgotPassword");
const Cv = require("../models/cv");
const VehicleEvent = require("../models/material_resources/events/vehicleEvent");
const RoomEvent = require("../models/material_resources/events/roomEvent");
const UserEvent = require("../models/technical_team/userEvent");
const path = require('path');
const nodemailer = require("nodemailer");
const moment = require("moment");




function setUserTitle(experience) {
  /* Check experience years and set a title for the Employee*/
  if (experience <= 1) {
    return "Junior";
  } else if (experience === 2) {
    return "Junior+";
  } else if (experience === 3) {
    return "Junior++";
  } else if (experience === 4 && experience === 5) {
    return "Senior-";
  } else if (experience >= 5 && experience < 10) {
    return "Senior";
  } else {
    return "Architect";
  }
}
module.exports.AddExternal = async function (req, res, next) {
  // console.log("req body", {...req.body})
  const certifs = req.files.map(file => {
    return file.filename;
  })
  const external_cert = certifs.filter(certif => {
    return path.extname(certif).toLowerCase() === '.pdf';
});
  const external_image = certifs.filter(certif => {
    return path.extname(certif).toLowerCase() === '.png' || path.extname(certif).toLowerCase() === '.jpg' || path.extname(certif).toLowerCase() === '.jpeg';
});
// console.log({"img from back":external_image,"pdfs from back":external_cert})
  try {
    const user = await User.create({ 
      firstName : req.body.fname,
      lastName : req.body.lname,
      email:req.body.fname+"."+req.body.lname+"@external.com",
      departement : req.body.departement,
      external_docs : external_cert,
      image : external_image[0],
      external : true,
      isEnabled : "Active"
    });
  // console.log({"user after creation":user})
      if (user) {
        const externals = await User.find({ external : true})
        res.status(200).json(externals);
      }
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports.signUp = async function (req, res, next) {
  const body = { ...req.body };
  try {
    hashedPassword = await bcrypt.hash(body.password, 10);
    body.password = hashedPassword;
    body.roles = [Roles.Engineer];
    body.title = setUserTitle(body.experience);
    
    const user = await User.create({ ...body });
    const cv = await Cv.create({ user: user._id });
   
      /** Create a user with career object*/
      const _user = await User.findByIdAndUpdate(user._id, {
        cv: cv._id,
      });
      if (_user && cv ) {
        res.status(200).json({
          message:
            "Signup request sent succefully , waiting for admin confirmation",
          user: _user,
        });
      }
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports.login = async function (req, res, next) {
  try {
    let fetchedUser = await User.findOne({ email: req.body.email }).populate(
      "roles"
    );
    if (!fetchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fetchedUser.isEnabled==="Inactive") {
      return res.status(403).json({
        message: "Unauthorised login. Waiting for register confirmation ",
      });
    }
    var result = await bcrypt.compare(req.body.password, fetchedUser.password);
    if (!result) {
      return res.status(500).json({ message: "Please check your password!" });
    }
    const token = jwt.sign(
      {
        email: fetchedUser.email,
        id: fetchedUser._id,
      },
      "secret_this_should_be_longer",
      { expiresIn: "2h" }
    );
    return res.status(200).json({
      token: token,
      expiresIn: 3600,
      userName: fetchedUser.firstName + fetchedUser.lastName,
      image: fetchedUser.image,
      id: fetchedUser._id,
      roles: fetchedUser.roles,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.checkPassword = async function (req, res, next) {
  try {
    let fetchedUser = await User.findById(req.body.id);

    var result = await bcrypt.compare(req.body.password, fetchedUser.password);
    if (!result) {
      return res.status(500).json("wrong password");
    }
    return res.status(200).json("ok");
  } catch (error) {
    return res.status(500).json({ message: "problem in bycript" });
  }
};
module.exports.updateUserRoles = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  const body = { ...req.body };
  var userRoles = [];

  body.roles.forEach((role) => {
    if (role === "ASSISTANT") {
      userRoles.push(Roles.sales_assistant);
    }
    if (role === "LAB-MANAGER") {
      userRoles.push(Roles.virt_manager);
    }
    if (role === "ENGINEER") {
      userRoles.push(Roles.Engineer);
    }
  });
  User.findByIdAndUpdate(ID, { $set: { roles: userRoles } })
    .then(() => {
      res.status(200).json("roles updates");
    })
    .catch((error) => res.status(500).json(error));
};
module.exports.UpdateUser = async function (req, res, next) {
  const body = { ...req.body };
  if (req.file) {
    body.image = req.file.filename;
  }
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  if (body.experience) {
    body.title = setUserTitle(body.experience);
  }
  User.findByIdAndUpdate(ID, { $set: body })
    .then((result) => {
      User.findById(ID)
        .populate("cv")
        .then((user) => {
          return res.status(200).json(user);
        });
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
};
module.exports.updatePass= async function (req,res,next){
  const userID = req.params.id;
  if (!ObjectId.isValid(userID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    // const salt = bcrypt.genSaltSync(10);
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  }catch (error) {
    return res.status(500).json(error.message);
  }
  try{
    const user = await User.findByIdAndUpdate(userID,{password:hashedPassword}) 
    res.status(200).json({message:"password updated successfuly"})
  } catch (error) {
    return res.status(500).json(error.message);
  }
}
module.exports.forgotPassword = async function (req, res, next) {
  try {
    const user = await User.findOne({email:req.body.email});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const code = Math.floor(Math.random() * 111111);
    await ForgetPassword.findOneAndDelete({ email: req.body.email });
    let forgetPassword = new ForgetPassword({
      email: req.body.email,
      code: code,
    });
   
    //send mail to user
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Prologic -- Verification code for changing password",
      text: "This is your verification code for changing password : " + code,
    });

    forgetPassword.save();
    return res.status(200).json(forgetPassword._id);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
module.exports.validateCode = async function (req, res) {
  try {
    let forgetPassword = await ForgetPassword.findOne({
      email: req.body.email,
    });
    if (forgetPassword.code === req.body.code) {
      return res.status(200).json({ id: forgetPassword._id , message : "Right code"});
    } else {
      return res.status(500).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports.changePswdAutorisation = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const forgotPassword = await ForgetPassword.findById(ID);
    if (forgotPassword) {
      res.status(200).json("ok");
    } else {
      res.status(401).json("error");
    }
  } catch (error) {
    res.status(401).json(error);
  }
};
module.exports.changePswd = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  const body = { ...req.body };
  try {
    body.password = await bcrypt.hash(body.password, 10);
    await User.findOneAndUpdate({ email: body.email }, { $set: body });
    await ForgetPassword.findByIdAndDelete(ID);
    res.status(200).json("password updated");
  } catch (error) {
    return res.status(500).json(error);
  }
};
module.exports.confirmSignUp = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }

  const user =await  User.findByIdAndUpdate(ID, { isEnabled: 'Active' });
  if (user) {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Prologic -- Register Request Accepted', // Fixed the quotation marks
      text: 'Your registration request has been accepted.',
      html: `
          <h1>Registration Request Accepted</h1>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>Your registration request has been accepted.</p>
          <p>Thank you for joining Prologic!</p>
          <p>Best regards</p>
          <p>DEV TEAM</p>
      `
  };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  return res.status(200).json({ message: "User accepted" });
};
module.exports.getAllUsers = async function (req, res) {
  User.find({
    $and: [
      { roles: { $ne: "ADMIN" },
        isEnabled:"Active"
     },
    ],
  })
    .select("-password")
    .populate("cv", "skills")
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => res.status(404).json({ message: error }));
};
module.exports.getAllTeamLeaders = async function (req, res) {
  User.find({
    $and: [
      { teamLeader: true,
        isEnabled:"Active"
     },
    ],
  })
    .select("-password")
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => res.status(404).json({ message: error }));
};
module.exports.getSignUpRequests = async function (req, res) {
  User.find({ isEnabled: 'Inactive' })
    .select("-password")
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => res.status(404).json({ message: error }));
};
module.exports.deleteUser = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const user = await User.findByIdAndRemove({ _id: ID });
    if (user) {
      await VehicleEvent.deleteMany({
        $or: [{ applicant: user._id }, { driver: user._id }],
      });
      await Cv.findByIdAndRemove(user.cv._id);
     
      await RoomEvent.deleteMany({
        applicant: user._id,
      });
      await UserEvent.deleteMany({
        $or: [
          {
            applicant: user._id,
            engineer: user._id,
          },
        ],
      });
     
      const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Prologic -- Register Request Declined', // Fixed the quotation marks
      text: 'Unfortunately, your registration request has been declined.',
      html: `
          <h1>Registration Request Declined</h1>
          <p>Dear  ${user.firstName} ${user.lastName},</p>
          <p>Unfortunately, your registration request has been declined.</p>
          <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
          <p>Thank you for your understanding!</p>
          <p>Best regards</p>
          <p>DEV TEAM</p>
      `
  };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
          console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
    res.status(200).json({ message: "User deleted succefully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports.getUserById = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const user = await User.findById(ID).populate("cv");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
module.exports.getDrivers= async function(req,res){
  try {
    const drivers = await User.find({drivingLisence :true})
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: error });
  }
}
module.exports.techEventsById = async function(req,res){
  const ID = req.params.id;
  if (!ObjectId.isValid) {
    return res.status(404).json({ message: "Technician not found" })
  }
  try {
    const events = await UserEvent.find({engineer: ObjectId(ID)}).populate({path:"applicant"})
    if (events) {
      res.status(200).json(events);
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.getEventById = async function(req,res){
  const ID = req.params.id;
  if (!ObjectId.isValid) {
    return res.status(404).json({ message: "Event not found " })
  }
  try {
    const event = await UserEvent.findOne({_id: ID
    }).populate({ path: "applicant", select: "-password" })
      .populate({ path: "engineer", select: "-password" })
    if (event) {
      res.status(200).json(event);
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.getEventsByDate = async function(req,res){
  try {
      let eventList = []
      let techs = await User.find({
        departement:{ $in: ["System", "Networking", "Cyber Security"]},
        roles :{$ne : "ADMIN"}
      })
      let event
      if (req.body.dateTypeOption==="dateRang"){
        if(req.body.userTypeSelected === "allUsers"){
          for(let tech of techs){
            event = await UserEvent.find({
              engineer : tech._id,
              start: { $gte: req.body.dateRangStart },
              end: { $lte: req.body.dateRangEnd },
            }).populate({ path: "engineer", select: "-password" })
            eventList.push(event)
          }
        }
        else if(req.body.userTypeSelected === "oneUser"){
          event = await UserEvent.find({
            engineer : req.body.tech,
            start: { $gte: req.body.dateRangStart },
            end: { $lte: req.body.dateRangEnd },
          }).populate({ path: "engineer", select: "-password" })
          eventList.push(event)
        }
      }
      else if (req.body.dateTypeOption==="oneDay"){
        
        if(req.body.userTypeSelected === "allUsers"){
          for(let tech of techs){
            event = await UserEvent.find({
              engineer : tech._id,
              start: { $gte: req.body.day },
              end: { $lt: req.body.day_1 },
            }).populate({ path: "engineer", select: "-password" })
            eventList.push(event)
          }
        }
        else if(req.body.userTypeSelected === "oneUser"){
          event = await UserEvent.find({
            engineer : req.body.tech,
            start: { $gte: req.body.day },
            end: { $lt: req.body.day_1 },
          }).populate({ path: "engineer", select: "-password" })
          eventList.push(event)
        }
      }
      res.status(200).json(eventList)
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.getUserByEmail = async function(req,res){
  try {
    const user = await User.findOne({email:req.body.email})
    if (user) {
      res.status(200).json(user);
    }else{
      res.status(404).send({message:'No user found with this email'})
    }
  }
  catch (error) {
    res.status(500).json(error); 
  }
}
module.exports.switchToExternal = async function(req,res){
  const userID = req.params.id;
  if (!ObjectId.isValid(userID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const user = await User.findByIdAndUpdate(userID,{
      external : true,
      external_docs : []
    })
    res.status(200).json(user)
  }catch(error){
    res.status(500).json(error)
  }
}
module.exports.uploadSignature = async function(req,res){
  const userID = req.params.id;
  if (!ObjectId.isValid(userID)) {
    return res.status(404).json("ID is not valid");
  }
  req.body.signature = req.file.filename
  try {
    const user = await User.findByIdAndUpdate(userID,{
     signature : req.file.filename
    })
    res.status(200).json("Signature uploaded successfully!")
  }catch(error){
    res.status(500).json(error)
  }
}
module.exports.getAdmin = async function(req,res){
  
  try {
    const admin = await User.findOne({
     roles : "ADMIN"
    })
    res.status(200).json(admin)
  }catch(error){
    res.status(500).json(error)
  }
}


const { ObjectId } = require("mongodb");
const VirtualizationEnv = require("../../models/material_resources/virtualization_env");
const User = require("../../models/user");
const nodemailer = require("nodemailer");

/** Add VirtualizationEnv */
module.exports.addVirtEnv = async function (req, res, next) {
    const generatedNumbers = new Set();
    do {
    code = Math.floor(1000 + Math.random() * 9000);
    } while (generatedNumbers.has(code));
    generatedNumbers.add(code);
    try {
        const virtualizationEnv = new VirtualizationEnv({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            code:"LAB"+code,
            departement:req.body.departement,
            type:req.body.type,
            backup:req.body.backup,
            ram:req.body.ram,
            disk:req.body.disk,
            processor:req.body.processor,
            dhcp:req.body.dhcp,
            start:req.body.start,
            end:req.body.end,
            goals:req.body.goals,
            applicant:req.body.applicant       
        })
        const v = await virtualizationEnv.save();
        const users = await User.find()

        let labManager 
        for (let i = 0; i < users.length; i++) {
            if (users[i].roles[0]==="LAB-MANAGER") {
                 labManager = users[i]
            }
        }
        if (v) {
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
                        to: labManager.email,
                        subject: 'Prologic -- Lab Booking', // Fixed the quotation marks
                        text: `You have a new lab request from ${req.body.firstName} ${req.body.lastName}.`,
                        html: `
                            <h1>New Lab Request</h1>
                            <p>You have a new lab request from <strong>${req.body.firstName} ${req.body.lastName}</strong>.</p>
                            <p><strong>You can check it out <a href="https://pte.prologic.com.tn:3200/#/dashboard/myRequest">here</a></strong></p>
                            <p>Thank you for using Prologic Technical Experience booking system.</p>
                            <p>Best regards</p>
                            <p>DEV TEAM</p>`
                    };
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        }
        res.status(200).json(v);
    
    }catch (error) {
        res.status(500).json("internal server error: " + error.message);
    }
}

/** Delete VirtualizationEnv */
module.exports.deleteVirtEnv = async function (req, res, next) {
    try {
    const virtualizationEnv =await VirtualizationEnv.findByIdAndDelete(
        {
            _id : req.params.id
        })
        res.status(200).json("Virtualization-Env deleted succefully");
        
    
    }catch (error) {
        res.status(404).json("Virtualization-Env not found" + error.message);
    }
}
/** getAllVirtualizationEnvs  */
module.exports.getAllVirtsEnv = async function (req, res, next) {
    try {
        const virtualizationEnv =await VirtualizationEnv.find({}).populate({ path: "applicant", select: "firstName lastName image" });
        res.status(200).json(virtualizationEnv);
            
    }catch (error) {
        res.status(500).json("internal server error: " + error.message);
    }
}
/** getVirtualizationEnvById  */
module.exports.getVirtEnvById = async function (req, res, next) {
    try {
    const virtualizationEnv =await VirtualizationEnv.findById({
        _id: req.params.id
    }).populate({ path: "applicant", select: "firstName lastName image" });
        res.status(200).json(virtualizationEnv);
        
    }catch (error) {
        res.status(404).json("virtualization-Env not found" + error.message);
    }
}

module.exports.acceptLabRequest = async function (req,res) {
    try {
        const ID = req.params.id;
        if (!ObjectId.isValid(ID)) {
            return res.status(404).json("ID is not valid");
        }
        let oldRecord= await VirtualizationEnv.findOne({_id:ID});
        const labReq = await VirtualizationEnv.findByIdAndUpdate(ID, 
            { 
                isAccepted: true, status:"Active",
                ram:req.body.ram,
                disk:req.body.disk,
                processor:req.body.processor,
            });
            let isSameResources = true
        if(oldRecord.ram != labReq.ram || oldRecord.disk != labReq.disk || oldRecord.processor != req.body.processor){
            isSameResources = false;
        }   
        const userApplicant = await User.findOne({_id:labReq.applicant._id})
        
        if (labReq) {
                const transporter = nodemailer.createTransport({
                    host: "smtp.office365.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                      },
                    });
                  let mailOptions
                  if(isSameResources){
                     mailOptions = {
                        from: process.env.EMAIL,
                        to: labReq.email,
                        subject: 'Prologic -- Lab Booking', // Fixed the quotation marks
                        text: `
                            The lab manager has just accepted your request. Your lab is now active.
                            
                            Your VM Credential is:
                            IP Address: ${req.body.ip}
                            IP Range: ${req.body.ip_start} <--------> ${req.body.ip_end}
                            Username: ${req.body.uname}
                            Password: ${req.body.password}
                            
                            VM Resources:
                            RAM (GB): ${req.body.ram}
                            DISK (GB): ${req.body.disk}
                            Processors: ${req.body.processor}
                        `,
                        html: `
                            <h1>Lab Booking Confirmation</h1>
                            <p>The lab manager has just accepted your request. Your lab is now active.</p>
                            <h2>Your VM Credentials:</h2>
                            <p><strong>IP Address:</strong> ${req.body.ip}</p>
                            <p><strong>IP Range:</strong> ${req.body.ip_start} <strong>to</strong> ${req.body.ip_end}</p>
                            <p><strong>Username:</strong> ${req.body.uname}</p>
                            <p><strong>Password:</strong> ${req.body.password}</p>
                            <h2>VM Resources:</h2>
                            <p><strong>RAM (GB):</strong> ${req.body.ram}</p>
                            <p><strong>DISK (GB):</strong> ${req.body.disk}</p>
                            <p><strong>Processors:</strong> ${req.body.processor}</p>
                        `
                    };
                    }else{
                         mailOptions = {
                            from: process.env.EMAIL,
                            to: labReq.email,
                            subject: 'Prologic -- Lab Booking', // Fixed the quotation marks
                            text: `
                                Your lab is now active, but we've had to reduce some of the resources you requested due to constraints.
                                Thank you for your understanding, and we apologize for any inconvenience caused.
                        
                                Your VM Credentials:
                                IP Address: ${req.body.ip}
                                IP Range: ${req.body.ip_start} <--------> ${req.body.ip_end}
                                Username: ${req.body.uname}
                                Password: ${req.body.password}
                        
                                VM Resources:
                                RAM (GB): ${req.body.ram}
                                DISK (GB): ${req.body.disk}
                                Processors: ${req.body.processor}
                            `,
                            html: `
                                <h1>Lab Booking Confirmation</h1>
                                <p>Your lab is now active, but we've had to reduce some of the resources you requested due to constraints.</p>
                                <p>Thank you for your understanding, and we apologize for any inconvenience caused.</p>
                                <h2>Your VM Credentials:</h2>
                                <p><strong>IP Address:</strong> ${req.body.ip}</p>
                                <p><strong>IP Range:</strong> ${req.body.ip_start} <strong>to</strong> ${req.body.ip_end}</p>
                                <p><strong>Username:</strong> ${req.body.uname}</p>
                                <p><strong>Password:</strong> ${req.body.password}</p>
                                <h2>VM Resources:</h2>
                                <p><strong>RAM (GB):</strong> ${req.body.ram}</p>
                                <p><strong>DISK (GB):</strong> ${req.body.disk}</p>
                                <p><strong>Processors:</strong> ${req.body.processor}</p>
                            `
                        };
                }
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
        } 
        res.status(200).json(labReq)


    } catch (error) {
        res.status(500).json({ message: error });
    }
}
module.exports.declineLabRequest = async function (req,res) {
    try {
        const ID = req.params.id;
        if (!ObjectId.isValid(ID)) {
            return res.status(404).json("ID is not valid");
        }
        const labReq = await VirtualizationEnv.findByIdAndUpdate(ID, { isAccepted: false, status:"Declined" });
        const userApplicant = await User.findOne({_id:labReq.applicant._id})
        if (labReq) {
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
                        to: userApplicant.email,
                        subject: 'Prologic -- Lab Booking', // Fixed the quotation marks
                        text: 'The lab manager just declined your request.',
                        html: `
                            <h1>Lab Booking Update</h1>
                            <p>Dear ${userApplicant.firstName} ${userApplicant.lastName},</p>
                            <p>The lab manager has just declined your request.</p>
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
        res.status(200).json(labReq)


    } catch (error) {
        res.status(500).json({ message: error });
    }
}
module.exports.getUserLabEnv = async function (req,res) {
    try{
        const x=[];
        const ID = req.params.id;
        if (!ObjectId.isValid(ID)) {
            return res.status(404).json("ID is not valid");
        }
        const userReq = await VirtualizationEnv.find()
        if (userReq){
            for(let i=0 ; i<userReq.length;i++){
                if(userReq[i].applicant==ID)
                x.push(userReq[i])
            }
        }
        res.status(200).json(x)
    }catch(error){
        console.log(error);
    }
}
module.exports.getActiveLabs = async function (req,res){
    try {
        const activeLabs = await VirtualizationEnv.find({
            isAccepted:true
        })
        res.status(200).json(activeLabs)
    } catch (error) {
        res.status(500).json('Internal Server Error')
    }
}
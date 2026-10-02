const { ObjectId } = require("mongodb");
const User = require("../models/user");
const Leave = require("../models/leave");
const nodemailer = require("nodemailer");


module.exports.addRequest =async function  (req, res, next) {
        const generatedNumbers = new Set();
        do {
        code = Math.floor(1000 + Math.random() * 9000);
        } while (generatedNumbers.has(code));
        generatedNumbers.add(code);

        let leave
        try {
            if(req.body.type=='Unpaid Leave'){
             leave = new Leave({
                fullName:req.body.fullName,
                email:req.body.email,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                note:req.body.note,
                type:req.body.type,
                code:"L"+code,
                applicant:req.body.applicant,
                status:'Pending 1/2',
                supervisor:req.body.supervisor,
                supervisorAccepted : true
            })
        }else if(req.body.type=='Maternity Leave'){
            let file 
            if (req.file) {
                file = req.file.filename
            }
             leave = new Leave({
                fullName:req.body.fullName,
                email:req.body.email,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                note:req.body.note,
                certif : file,
                type:req.body.type,
                code:"L"+code,
                supervisor:req.body.supervisor,
                applicant:req.body.applicant,
            })
        }else{
            leave = new Leave({
                fullName:req.body.fullName,
                email:req.body.email,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                note:req.body.note,
                type:req.body.type,
                code:"L"+code,
                supervisor:req.body.supervisor,
                applicant:req.body.applicant,
            })
        }
        if(res.locals.user.roles.includes("ASSISTANT") || res.locals.user.teamLeader===true || res.locals.user.departement==='Cyber Security' || res.locals.user.departement==='Administration' ){
            let file 
            if (req.file) {
                file = req.file.filename
            }
            leave = new Leave({
                fullName:req.body.fullName,
                email:req.body.email,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                note:req.body.note,
                certif: file,
                type:req.body.type,
                code:"L"+code,
                supervisor:req.body.supervisor,
                applicant:req.body.applicant,
                supervisorAccepted : true,
                status : "Pending 1/2"
            })
        }
            const l = await leave.save();
            const leavee = await Leave.findOne({
                code : l.code
            }).populate({ path: "supervisor", select: "firstName lastName email _id" })
              .populate({ path: "applicant", select: "firstName lastName email _id" })
            
            
            if(leavee){
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
                        to: leavee.supervisor.email,
                        subject: 'Prologic -- New Leave Request', // Fixed the quotation marks
                        text: `You have a new leave request from ${leavee.applicant.firstName} ${leavee.applicant.lastName}. Check it out.`,
                        html: `
                            <h1>Leave Request Approval</h1>
                            <p>Dear ${leavee.supervisor.firstName} ${leavee.supervisor.lastName},</p>
                            <p>You have a new leave request from <strong>${leavee.applicant.firstName} ${leavee.applicant.lastName}</strong>. 
                            Please <a href="https://pte.prologic.com.tn:3200/#/dashboard/myLeave">check it out</a>.</p>
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
            res.status(200).json(l);
        
        }catch (error) {
            res.status(500).json("internal server error: " + error.message);
        }
    }
module.exports.managerAccept =async function  (req, res, next) {
    const ID = req.params.id
        if(!ObjectId.isValid(ID)){
            return res.status(400).json("Invalid Leave ID")
        }
    try {
        const leave = await Leave.findByIdAndUpdate(
            ID,
            {
                managerAccepted:true,
                status:"Approved"
            },
            )
            if(leave){
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
                        to: leave.email,
                        subject: 'Prologic -- Leave Request Final Approval', // Fixed the quotation marks
                        text: 'The admin has just approved your leave request. Enjoy it!',
                        html: `
                            <h1>Leave Request Final Approval</h1>
                            <p>Dear ${leave.fullName},</p>
                            <p>The admin has just approved your leave request. Enjoy your time off!</p>
                            <p>If you have any questions, feel free to reach out.</p>
                            <p>Thank you!</p>
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
            res.status(200).json(leave);
        }catch (err) {
            res.status(500).json(err.message);
        }
    }
module.exports.managerDecline =async function  (req, res, next) {
        const ID = req.params.id
            if(!ObjectId.isValid(ID)){
                return res.status(400).json("Invalid Leave ID")
            }
        try {
            const leave = await Leave.findByIdAndUpdate(
                ID,
                { 
                    status:"Declined"
                },
                )
                if(leave){
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
                        to: leave.email,
                        subject: 'Prologic -- Leave Request Declined', // Fixed the quotation marks
                        text: 'Unfortunately, the admin has just declined your leave request.',
                        html: `
                            <h1>Leave Request Update</h1>
                            <p>Dear ${leave.fullName},</p>
                            <p>Unfortunately, the admin has just declined your leave request.</p>
                            <p>If you have any questions or would like to discuss this further, please feel free to reach out.</p>
                            <p>Thank you for your understanding.</p>
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
                res.status(200).json(leave);    
            }catch (err) {
                res.status(500).json(err.message);
            }
    }
module.exports.workerAccept =async function  (req, res, next) {
    const ID = req.params.id
        if(!ObjectId.isValid(ID)){
            return res.status(400).json("Invalid Leave ID")
        }
    try {
        const leave = await Leave.findByIdAndUpdate(
            ID,
            { 
                supervisorAccepted:true,
                status:"Pending 1/2"
            },
            )
            if(leave){
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
                        to: leave.email,
                        subject: 'Prologic -- Leave Request Accepted 1/2', // Fixed the quotation marks
                        text: 'Your supervisor has just accepted your leave request. Please wait until the admin approves it as well!',
                        html: `
                            <h1>Leave Request Update</h1>
                            <p>Dear ${leave.fullName},</p>
                            <p>Your supervisor has just accepted your leave request. Please wait until the admin approves it as well!</p>
                            <p>Thank you for your patience.</p>
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
            res.status(200).json(leave);
        }catch (err) {
            res.status(500).json(err.message);
        }
    }
module.exports.workerDecline =async function  (req, res, next) {
        const ID = req.params.id
            if(!ObjectId.isValid(ID)){
                return res.status(400).json("Invalid Leave ID")
            }
        try {
            const leave = await Leave.findByIdAndUpdate(
                ID,
                { 
                    status:"Declined"
                },
                )
                if (leave){
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
                        to: leave.email,
                        subject: 'Prologic -- Leave Request Declined',
                        text: 'Your supervisor has just declined your leave request.',
                        html: `
                            <h1>Leave Request Update</h1>
                            <p>Dear ${leave.fullName},</p>
                            <p>Your supervisor has just declined your leave request.</p>
                            <p>If you have any questions or need further assistance, please feel free to reach out to your supervisor.</p>
                            <p>Thank you for your understanding.</p>
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
                res.status(200).json(leave);    
            }catch (err) {
                res.status(500).json(err.message);
            }
    }
module.exports.getLeave =async function  (req, res, next) {
        try {
            const leaves = await Leave.find({
                supervisorAccepted:true
            }).populate('applicant supervisor')
                res.status(200).json(leaves);    
            }catch (err) {
                res.status(500).json(err.message);
            }
    
    }
module.exports.getUserLeave =async function  (req, res, next) {
        const userId = req.params.id
        if(!ObjectId.isValid(userId)){
            return res.status(400).json("Invalid User ID")
        }
        try{
            const userLeave = await Leave.find({
                applicant : userId
            }).populate('applicant supervisor')            
            return res.status(200).json(userLeave);
        }catch (err) {
            res.status(500).json(err.message);
        }
    }
module.exports.getLeaveById =async function  (req, res, next) {
        const leaveId = req.params.id
        if(!ObjectId.isValid(leaveId)){
            return res.status(400).json("Invalid User ID")
        }
        try{
            const userLeave = await Leave.find({
                applicant : leaveId
            })            
            return res.status(200).json(userLeave);
        }catch (err) {
            res.status(500).json(err.message);
        }
    }
module.exports.deleteLeave =async function  (req, res, next) {
        const leaveId = req.params.id
        if(!ObjectId.isValid(leaveId)){
            return res.status(400).json("Invalid User ID")
        }
        try{
            const userLeave = await Leave.findByIdAndDelete({
                _id : leaveId
            })            
            return res.status(200).json(userLeave);
        }catch (err) {
            res.status(500).json(err.message);
        }
    }
module.exports.getWorkerRequests= async function (req, res, next){
    const workerId = req.params.id
        if(!ObjectId.isValid(workerId)){
            return res.status(400).json("Invalid User ID")
        }
    try {
        const workerRequests =await Leave.find({
            supervisor:workerId
        })
        res.status(200).json(workerRequests)
    } catch (error) {
        res.status(500).json(error)
    }
}
   
const { ObjectId } = require("mongodb");
const User = require("../../models/user");

const UserEvent = require("../../models/technical_team/userEvent");
const nodemailer = require("nodemailer");
const VehicleEvent = require("../../models/material_resources/events/vehicleEvent");


// create event
module.exports.createEvent = async function (req, res) {
  const body = {...req.body}
  try {
    const eventExist = await UserEvent.find({
      start: { $gte: body.start },
      end: { $lte: body.end },
      engineer: body.engineer,
    });

    // if dates are  already reserved
    if (eventExist.length > 0) {
      return res.status(500).json("Dates already reserved");
    } else {
      
      const event = await UserEvent.create(body)
      eventMaker = await User.findById(body.applicant)
      eventEng = await User.findById(body.engineer)
      // if (event) {
      //     const transporter = nodemailer.createTransport({
      //       host: "smtp.office365.com",
      //       port: 587,
      //       secure: false,
      //       auth: {
      //           user: process.env.EMAIL,
      //           pass: process.env.PASSWORD,
      //         },
      //       });
      //       const mailOptions = {
      //         from: process.env.EMAIL,
      //         to: eventEng.email,
      //         subject: 'Prologic -- Intervention Notification',
      //         text: `${eventMaker.firstName} ${eventMaker.lastName}, you just confirmed that you're going to '${req.body.address}' for '${req.body.job}'.`,
      //         html: `
      //             <h1>Intervention Notification</h1>
      //             <p>Dear ${eventMaker.firstName} ${eventMaker.lastName},</p>
      //             <p>You just confirmed that you're going to <strong>'${req.body.address}'</strong> for <strong>'${req.body.job}'</strong>.</p>
      //             <p>Thank you for using Prologic Technical Experience booking system.</p>
      //             <p>Best regards</p>
      //             <p>DEV TEAM</p>
      //         `
      //     };
      //       transporter.sendMail(mailOptions, function(error, info){
      //         if (error) {
      //         console.log(error);
      //         } else {
      //           console.log('Email sent: ' + info.response);
      //         }
      //       });
      // }
      res.status(200).json(event);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

/** get events by UserID*/
module.exports.getUserEvents = async function (req, res) {
  const ID = req.query.engineer;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    //if connected user is admin
    if (res.locals.user.roles.includes("admin")) {
      const events = await UserEvent.find({
        engineer: ID,
        start: { $gte: req.query.start },
        end: { $lte: req.query.end },
      }).populate({ path: "applicant", select: "firstName lastName image" });

      if (events) {
        res.status(200).json(events);
      }
    } else {
      //connected user is not admin=> cannot display unconfirmed events of other users

      const events = await UserEvent.find({
        $and: [
          { engineer: ID },
          { start: { $gte: req.query.start } },
          { end: { $lte: req.query.end } },

          {
            $or: [
              {
                $and: [
                  { isAccepted: false },
                  {
                    $or: [
                      { applicant: res.locals.user._id },
                      { engineer: res.locals.user._id },
                    ],
                  },
                ],
              },
              { isAccepted: true },
            ],
          },
        ],
      }).populate({ path: "applicant", select: "firstName lastName image" });

      if (events) {
        res.status(200).json(events);
      }
    }
  } catch (error) {
    res.status(404).json("there is an error ");
  }
};
module.exports.getAllUsersEvents = async function (req,res){
  try {
    const usersEvents = await UserEvent.find()
      .populate({ path: "applicant", select: "_id firstName lastName" })
      .populate({ path: "engineer", select: "firstName lastName" })
    res.status(200).json(usersEvents)

  } catch (error) {
    res.send(500).json("Internal server error")
  }
}
/**Update Event  */
module.exports.updateEvent = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    // if (body.isAccepted) {
    //   const event = await UserEvent.findById(ID);

    //   //check if there is a conflict (to assure that there  is no conflicts)
    //   const checkExist = await UserEvent.find({
    //     start: { $gte: event.start },
    //     end: { $lte: event.end },
    //     engineer: event.engineer,
    //     isAccepted: true,
    //   });

    //   if (checkExist.length > 0) {
    //     return res.status(500).json("Dates already reserved");
    //   }
      //Accept Event
      const updateEvent = await UserEvent.findByIdAndUpdate(ID, {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        job: req.body.job,
        address: req.body.address,
      });

      if (updateEvent) return res.status(200).json(updateEvent);
    
  } catch (error) {
    res.status(501).json(error);
  }
};
/**deleteEvent */
module.exports.deleteEvent = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const event = await UserEvent.findByIdAndDelete({ _id: ID });
    const vehicleEventToDelete = await VehicleEvent.findByIdAndDelete(event.vehicleEvent)
    if (event && vehicleEventToDelete) return res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  }
};

//Upload PDF
// module.exports.upload = async function (req, res, next) {
//   const body = { ...req.body };

//   body.pdf = req.file.filename;

//   try {
//       const userEvent = await UserEvent.findOneAndUpdate({ ...body });
//     const ID =  userEvent._id ;
//       const _user = await UserEvent.findByIdAndUpdate(userEvent._id, {
//         ID: userEvent._id,
//       });
//       if (_user && ID) {
//         res.status(200).json({
//           message:
//             "File upload succefully",
//           user: _user,
//         });
//       }
    
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };
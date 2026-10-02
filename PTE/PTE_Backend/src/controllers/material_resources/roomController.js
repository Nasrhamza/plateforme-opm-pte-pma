const { ObjectId } = require("mongodb");
const Room = require("../../models/material_resources/room");
const RoomEvent = require("../../models/material_resources/events/roomEvent");
const User = require("../../models/user");
const nodemailer = require("nodemailer");
const { path } = require("pdfkit");
const { formatDate } = require("../../tools/dates");

/** Add Room */
module.exports.addRoom = async function (req, res, next) {
  try {
    const body = { 
      label: req.body.label, 
      location: req.body.location,
      capacity:req.body.capacity
    };
    const room = await Room.create({ ...body });
    if (room) {
      res.status(200).json(room);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports.editRoom = async function(req, res, next) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json('ID is not valid');
  }
  try {
    const room = await Room.findByIdAndUpdate(
      ID,
      {
        label: req.body.label,
        location: req.body.location,
        capacity: req.body.capacity,
      },
      { new: true } 
    );

    if (!room) {
      return res.status(404).json('room not found');
    }
    return res.json(room);
  } catch (err) {
    return res.status(500).json(err);
  }
};
/** Delete Room */
module.exports.deleteRoom = async function (req, res, next) {
  try {
    const room = await Room.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json(room);
  } catch (error) {
    res.status(404).json(error);
  }
};
/** getAllRooms  */
module.exports.getAllRooms = async function (req, res) {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json(error);
  }
};
/**Seach a room by label or location */
module.exports.searchRoom = async function (req, res) {
  try {
    const rooms = await Room.find({
      $or: [
        {
          label: new RegExp(req.query.text, "i"),
        },
        {
          location: new RegExp(req.query.text, "i"),
        },
      ],
    });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(404).json(error);
  }
};

/*******************************************************/
/***Events managment */
/*******************************************************/
module.exports.createEvent = async function (req, res) {
  try {
    const eventExist = await RoomEvent.find({
      start: { $gte: req.body.start },
      end: { $lte: req.body.end },
      room: req.body.room,
      //isAccepted: true,
    });

    // if dates are  already reserved
    if (eventExist.length > 0) {
      return res.status(500).json("Dates already reserved");
    } else {
      const body = {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        room: req.body.room,
        applicant: req.body.applicant,
      };
      const event = await RoomEvent.create({ ...body });
      eventMaker = await User.findById(event.applicant)
      eventRoom = await Room.findById(event.room)
     
      if (event) {
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
            to: eventMaker.email,
            subject: 'Prologic -- Room Booking', // Fixed the quotation marks
            text: `You just booked the room **${eventRoom.label}** in **${eventRoom.location}** from **${formatDate(event.start)}** to **${formatDate(event.end)}**.`,
            html: `
                <h1>Room Booking Confirmation</h1>
                <p>You just booked the room <strong>${eventRoom.label}</strong> in <strong>${eventRoom.location}</strong>.</p>
                <p>Booking Details:</p>
                <ul>
                    <li><strong>Start Time:</strong> ${formatDate(event.start)}</li>
                    <li><strong>End Time:</strong> ${formatDate(event.end)}</li>
                </ul>
                <p>Thank you for using Prologic Technical Experience booking system.</p>
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
        res.status(200).json(event);
      
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/**Update Event  */
module.exports.updateEvent = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
      // const event = await RoomEvent.findById(ID);

      // //check if there is a conflict (to assure that there  is no conflicts)
      // const checkExist = await RoomEvent.find({
      //   start: { $gte: event.start },
      //   end: { $lte: event.end },
      //   room: event.room,
      // });
      // console.log(checkExist,checkExist[0]._id!==ObjectId(ID))
      // if (checkExist[0]._id!==ObjectId(ID)) {
      //   return res.status(500).json("Dates already reserved");
      // }
      //update Event
      const updateEvent = await RoomEvent.findByIdAndUpdate(ID, {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        //room: req.body.room,
      });
      if (updateEvent) return res.status(200).json(updateEvent);
  } catch (error) {
    res.status(500).json(error);
  }
};

/**deleteEvent */
module.exports.deleteEvent = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const event = await RoomEvent.findByIdAndDelete({ _id: ID });
    res.status(200).json(event);
  } catch (error) {
    res.status(404).json(error);
  }
};
module.exports.getEventById = async function(req,res){
  const ID = req.params.id;
  if (!ObjectId.isValid) {
    return res.status(404).json({ message: "Event not found " })
  }
  try {
    const event = await RoomEvent.findOne({_id: ObjectId(ID),
    }).populate({ path: "applicant", select: "_id firstName lastName image" })
      .populate({ path: "room" })
    if (event) {
      res.status(200).json(event);
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.roomEventsById = async function(req,res){
  const ID = req.params.id;
  if (!ObjectId.isValid) {
    return res.status(404).json({ message: "Room not found" })
  }
  try {
    const events = await RoomEvent.find({room: ObjectId(ID)}).populate({path:"applicant"})
    if (events) {
      res.status(200).json(events);
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.getAllEvents = async function(req,res){
  try {
    const roomEvent = await RoomEvent.find()
      .populate({ path: "applicant", select: "_id firstName lastName image" })
      .populate({ path: "room" });
    res.status(200).json(roomEvent);
  } catch (error) {
    res.status(500).json(error);
  }
}



module.exports.tabRoomEvents = async function(req,res){
  const roomId = req.params.id

  if (!ObjectId.isValid(roomId)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    //if connected user is admin
    const events = await RoomEvent.find({
      room: roomId,
      // start: { $gte: req.query.start },
      // end: { $lte: req.query.end },
    }).populate({ path: "applicant", select: "firstName lastName"});
    if (events) {
      
      res.status(200).json(events);
    }
  } catch (error) {
    res.status(404).json("there is an error ");
  }
}
module.exports.tabletteAllRooms = async function (req, res) {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json(error);
  }
};
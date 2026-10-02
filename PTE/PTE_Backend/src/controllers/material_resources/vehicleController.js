const { ObjectId } = require("mongodb");
const Vehicle = require("../../models/material_resources/vehicle");
const GasCard = require("../../models/material_resources/GasCard");
const User = require("../../models/user");
const VehicleEvent = require("../../models/material_resources/events/vehicleEvent");
const nodemailer = require("nodemailer");
const { formatDate } = require("../../tools/dates");

/** Add Vehicle */
module.exports.addVehicle = async function (req, res) {
  try {
    const body = { ...req.body };
    const vehicle = await Vehicle.create({ ...body });
    if (vehicle) {
      res.status(200).json(vehicle);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
/** Delete Vehicle */
module.exports.deleteVehicle = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    const vehicle = await Vehicle.findByIdAndDelete(ID);
    const card = await GasCard.findOneAndDelete({ vehicle: ID });
    if (vehicle && card) {
      await VehicleEvent.deleteMany({ vehicle: vehicle._id });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json(error);
  }
};
/** getAllVehicles  */
module.exports.getAllVehicles = async function (req, res, next) {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json("internal server error: " + error.message);
  }
};
module.exports.getVehicleById = async function (req, res, next) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json('ID is not valid');
  }
  try {
    const vehicle = await Vehicle.findById(ID).populate('log.event');
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json("internal server error: " + error.message);
  }
};
module.exports.editVehicle = async function(req, res, next) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json('ID is not valid');
  }
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      ID,
      {
        model: req.body.model,
        registration_number: req.body.registration_number,
        type: req.body.type,
      },
      { new: true } // return the updated document
    );

    if (!vehicle) {
      return res.status(404).json('Vehicle not found');
    }
    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports.changeAvailability = async function (req, res, next) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json('ID is not valid');
  }
  try {
    const vehicle = await Vehicle.findById(ID);
    if (!vehicle) {
      return res.status(404).json('Vehicle not found');
    }
    vehicle.available = !vehicle.available;
    await vehicle.save();
    return res.json(vehicle);
  } catch (err) {
    return res.status(500).json(err);
  }
};
/**Seach a vehicle by type or registration number */
module.exports.searchVehicle = async function (req, res) {
  try {
    const vehicles = await Vehicle.find({
      $or: [
        {
          model: new RegExp(req.query.text, "i"),
        },
        {
          registration_number: new RegExp(req.query.text, "i"),
        },
        {
          type: new RegExp(req.query.text, "i"),
        },
      ],
    });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(404).json(error);
  }
};

/*******************************************************/
/***Events managment */
/*******************************************************/
module.exports.createEvent = async function (req, res) {
  const body = { ...req.body };
  try {
    const eventExist = await VehicleEvent.find({
      start: { $gte: body.start }, 
      end: { $lte: body.end },     
      vehicle: body.vehicle,       
    });
    
    if (eventExist.length > 0) {
      return res.status(500).json("Dates already reserved");
    } else {
      body.km = body.km * 2;

      const event = await VehicleEvent.create(body);
      const eventMaker = await User.findById(event.applicant);
      const vehicle = await Vehicle.findById(event.vehicle);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }
      const latestLog = vehicle.log[vehicle.log.length - 1];
      const oldKilometrage = vehicle.kmTotal 
      const newKilometrage = oldKilometrage + event.km;
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        event.vehicle, 
        {
          $push: {
            log: {
              event: event._id,            
              kilometrage: event.km,       
              reservationDate: event.reservationDate || Date.now()
            }
          },
          kmTotal: newKilometrage 
        },
        { new: true } 
      );

      res.status(200).json(event);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

/** get events by vehicle ID*/
module.exports.getVehicleEvents = async function (req, res) {
  const ID = req.body.vehicle;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }

  try {
    //if connected user is admin
    if (res.locals.user.roles.includes("admin")) {
      const events = await VehicleEvent.find({
        vehicle: ID,
        // start: { $gte: req.query.start },
        // end: { $lte: req.query.end },
      })
        .populate({ path: "driver", select: "firstName lastName image -_id" })
        .populate({ path: "applicant", select: "firstName lastName image" });
      if (events) {
        res.status(200).json(events);
      }
    } else {
      //connected user is not admin=> cannot display unconfirmed events of other users
      const events = await VehicleEvent.find({
        $and: [
          { vehicle: ID },
          // { start: { $gte: req.query.start } },
          // { end: { $lte: req.query.end } },

          {
            $or: [
              {
                $and: [
                  { isAccepted: false },
                  { applicant: res.locals.user._id },
                ],
              },
              { isAccepted: true },
            ],
          },
        ],
      })
        .populate({ path: "driver", select: "firstName lastName image -_id" })
        .populate({ path: "applicant", select: "firstName lastName image" });
      if (events) {
        res.status(200).json(events);
      } else {
        res.status(500).json(error);
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

/**Update Event  */
module.exports.updateEvent = async function (req, res) {
  const ID = req.params.id;
  const body = { ...req.body };
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    if (body.isAccepted) {
      // const event = await VehicleEvent.findById(ID);

      // //check if there is a conflict (to assure that there is no conflicts)
      // const checkExist = await VehicleEvent.find({
      //   start: { $gte: event.start },
      //   end: { $lte: event.end },
      //   room: event.room,
      //   isAccepted: true,
      // });

      // if (checkExist.length > 0) {
      //   return res.status(500).json("Dates already reserved");
      // }
      // //Accept Event
      // const accept = await VehicleEvent.findByIdAndUpdate(ID, {
      //   isAccepted: true,
      // });

      // delete non-confirmed events that are in conflict with the accepted event
      await VehicleEvent.deleteMany({
        vehicle: event.room,
        start: { $gte: event.start },
        end: { $gte: event.end },
        isAccepted: false,
      });

      if (accept) return res.status(200).json(accept);
    }
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
    const event = await VehicleEvent.findByIdAndDelete({
      _id: req.params.id,
    });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports.editEvent = async function (req, res) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try {
    // const event = await VehicleEvent.findById(ID);

    //   //check if there is a conflict (to assure that there is no conflicts)
    //   const checkExist = await VehicleEvent.find({
    //     start: { $gte: event.start },
    //     end: { $lte: event.end },
    //     vehicle: event.vehicle,
    //   });

    //   if (checkExist.length > 0) {
    //     return res.status(500).json("Dates already reserved");
    //   }
    const updateEvent = await VehicleEvent.findByIdAndUpdate(ID,{
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
      applicant: req.body.applicant,
      driver: req.body.driver,
      destination: req.body.destination
    });
    res.status(200).json(updateEvent);
  } catch (error) {
    res.status(404).json(error);
  }
};


module.exports.vehicleEventsById = async function(req,res){
  const ID = req.params.id;
  if (!ObjectId.isValid) {
    return res.status(404).json({ message: "Vehicle not found" })
  }
  try {
    const events = await VehicleEvent.find({
      vehicle: ObjectId(ID),
    }).populate({ path: "driver", select: "firstName lastName image _id" })
      .populate({ path: "applicant", select: "_id firstName lastName image" })
      .populate({ path: "vehicle" })
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
    const event = await VehicleEvent.findOne({_id: ObjectId(ID),
    }).populate({ path: "driver", select: "firstName email lastName image _id" })
      .populate({ path: "applicant", select: "_id email firstName lastName image" })
      .populate({ path: "vehicle" })
    if (event) {
      res.status(200).json(event);
    }
  }
  catch (error) {
    res.status(500).json(error);
  }
}
module.exports.getAllEvents = async function(req,res){
  try {
    const vehicleEvent = await VehicleEvent.find()
      .populate({ path: "driver", select: "firstName lastName image _id" })
      .populate({ path: "applicant", select: "_id firstName lastName image" })
      .populate({ path: "vehicle" });
    res.status(200).json(vehicleEvent);
  } catch (error) {
    res.status(500).json(error);
  }
}







module.exports.checkVehicleAvailability = async function(req,res){
  try {
    const vehicles = await Vehicle.find({available:true})
    let eventExist
    let availableCars = []
    for(let i=0;i<vehicles.length;i++){
      eventExist = await VehicleEvent.find({
        start: { $gte: req.body.start },
        end: { $lte: req.body.end },
        vehicle: vehicles[i]._id,
    });
    if(eventExist.length === 0){
      availableCars.push(vehicles[i])
    }
    }
    res.status(200).json({
      status : 200,
      message : "Check availability succeed",
      data : availableCars
    })
  } catch (error) {
    res.status(500).json({
      status : 500,
      message : "Check availability failed",
      error : error
    });
  }
}








module.exports.getVehicleCard = async function(req,res){
  const vehicleID = req.params.id;
  if (!ObjectId.isValid(vehicleID)) {
    return res.status(404).json({ message: "Vehicle not found" })
  }
  try {
    const card = await GasCard.findOne({vehicle:vehicleID}).populate('vehicle')
    if (card) {
      res.status(200).json({
        status : 200,
        message : "Card retrieved successfully",
        data : card
      });
    }
  } catch (error) {
    res.status(500).json({
      status : 500,
      message : "Error retrieving card",
      error : error
    });
  }
}
module.exports.addVehicleCard = async function(req,res){
  const body = {...req.body}
  try {
    const card = await GasCard.create(body)
    res.status(201).json({
      status : 201,
      message : "Card created successfully",
      data : card
    })
  } catch (error) {
    res.status(500).json({
      status : 500,
      message : "Error creating card",
      error : error
      });
  }
}
module.exports.updateVehicleCard = async function(req,res){
  const cardID = req.params.id;
  const body = {...req.body};
  
  if (!ObjectId.isValid(cardID)) {
    return res.status(404).json({ message: "Card not found" })
    }
  try {
    const card = await GasCard.findOneAndUpdate(cardID, body, {new : true})
    if (card) {
      res.status(200).json({
        status : 200,
        message : "Card updated successfully",
        data : card
      })
      }
    
  } catch (error) {
    res.status(500).json({
      status : 500,
      message : "Error updating card",
      error : error
      });
  }
}
module.exports.deleteVehicleCard = async function(req,res){
  const cardID = req.params.id;
  if (!ObjectId.isValid(cardID)) {
    return res.status(404).json({ message: "Card not found" })
    }
  try {
    const card = await GasCard.findByIdAndDelete(cardID)
    if (card) {
      res.status(200).json({
        status : 200,
        message : "Card deleted successfully",
        data : card
      })
      }
    
  } catch (error) {
    res.status(500).json({
      status : 500,
      message : "Error deleting card",
      error : error
      });
  }
}
module.exports.addConsumption = async function (req, res) {
  const body = { ...req.body };
  if (!ObjectId.isValid(body.card)) {
    return res.status(404).json({ message: "ID is not valid" });
  }
  try {
    const card = await GasCard.findById(body.card);

    if (!card) {
      return res.status(404).json({
        status: 404,
        message: "Card not found"
      });
    }
    const currentBalance = parseFloat(card.balance);
    const consumptionAmount = parseFloat(body.amount);
    if (isNaN(consumptionAmount) || consumptionAmount <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid consumption amount"
      });
    }
    if (consumptionAmount > currentBalance) {
      return res.status(400).json({
        status: 400,
        message: "Consumption amount exceeds the current balance"
      });
    }
    const newBalance = currentBalance - consumptionAmount;
    const updatedCard = await GasCard.findByIdAndUpdate(
      body.card,
      {
        $set: { balance: newBalance.toString() }, 
        $push: {
          consumption: {
            date: new Date(), 
            amount: consumptionAmount
          }
        }
      },
      { new: true }
    );
    if (updatedCard) {
      res.status(200).json({
        status: 200,
        message: "Consumption added successfully",
        data: updatedCard
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Card not found"
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Error adding consumption",
      error: error.message
    });
  }
};










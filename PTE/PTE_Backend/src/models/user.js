const mongoose = require("mongoose");
const Roles = require("./roles");

let avatar ="User.jpg"

const UserSchema = mongoose.Schema({

  matricule: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, },
  email: {
    type: String,
    required: true,
    unique: [true, "Email is already in use"],
  },
  password: { type: String },
  teamLeader:{type : Boolean },
  roles: [
    {
      type: String,
      enum: Object.values(Roles),
    },
  ],
  image: { type: String ,default: avatar},
  signature: { type: String ,default: ""},
  external :{ type: Boolean},
  external_docs: [String],
  nationality: { type: String  },
  FS: { type: String},
  bio: { type: String},
  birthDate: { type: Date},
  address: { type: String},
  departement: { type: String},
  drivingLisence: { type: Boolean },
  gender: { type: String }, 
  isEnabled: { type: String, default: 'Inactive' },
  experience: { type: Number, default: 0 },
  hiringDate: { type: Date},
  title: { type: String, default: "" },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  
  cv: { type: mongoose.Schema.Types.ObjectId, ref: "Cv" },

});

Object.assign(UserSchema.statics, {
  Roles,
});

module.exports = mongoose.model("User", UserSchema);

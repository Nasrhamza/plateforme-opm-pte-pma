const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
  },
  authority: {
    type: String,
    enum: ['client', 'technician', 'commercial', 'assistant', 'pmo','helpdeskUser'],
    required: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  valid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
}
);

const User = mongoose.model('User', userSchema);

module.exports = User;

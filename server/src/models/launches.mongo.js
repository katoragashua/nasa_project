const { Schema, default: mongoose, model } = require("mongoose");

const launchSchema = new Schema({
  flightNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
  },
  customers: {
    type: [String],
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
});


module.exports = mongoose.model("Launch", launchSchema);



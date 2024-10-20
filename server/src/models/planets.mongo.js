const { Schema, default: mongoose, model } = require("mongoose");

const planetSchema = new Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Planet", planetSchema);


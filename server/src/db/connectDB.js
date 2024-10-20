const mongoose = require('mongoose');

require('dotenv').config();
// Update below to match your own MongoDB connection string.
const MONGO_URI = process.env.MONGO_URI;

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const connectDB = async () => {
  // if (!MONGO_URI) {
  //   console.error("MONGO_URI not set");
  //   process.exit(1);
  // }
  return await mongoose.connect(MONGO_URI);
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };

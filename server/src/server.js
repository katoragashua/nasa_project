const http = require("http");
const { loadPlanets } = require("./models/planets.model.js");
const app = require("./app.js");
require("dotenv").config();
const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI

const { connectDB } = require("./db/connectDB.js");
const { loadLaunchesData } = require("./models/launches.model.js");
const Launches = require("./models/launches.mongo.js");
const Planets = require("./models/planets.mongo.js");

const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
console.log(PORT);

async function start() {
  try {
    await connectDB();
    const planets = await loadPlanets();
    await loadLaunchesData();
    server.listen(PORT, () => console.log(`Server listening on PORT ${PORT}`));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();

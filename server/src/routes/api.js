const { Router } = require("express");
const api = Router();

const planetsRouter = require("./planets.routes.js");
const launchesRouter = require("./launches.routes.js");

api.use("/planets", planetsRouter);
api.use("/launches", launchesRouter);

module.exports = api;
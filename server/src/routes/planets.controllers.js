const { StatusCodes } = require("http-status-codes");
const { getAllPlanets } = require("../models/planets.model");
const path = require("path");

async function httpGetAllPlanets(req, res) {
  const allPlanets = await getAllPlanets()
  console.log(allPlanets);
  res.status(StatusCodes.OK).json(allPlanets);
}

module.exports = {
  httpGetAllPlanets,
};

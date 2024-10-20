const express = require('express')
const { httpGetAllPlanets } = require('./planets.controllers')
const router = express.Router()


router.get("/", httpGetAllPlanets)

module.exports = router;
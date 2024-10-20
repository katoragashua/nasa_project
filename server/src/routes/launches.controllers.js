const {
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
} = require("../models/launches.model");
const { getPagination } = require("../services/query.js");

const httpGetAllLaunches = async (req, res) => {
  const { skip, limit } = getPagination(req.query);

  const launches = await getAllLaunches({ skip, limit });
  res.status(200).json(launches);
};

const httpAddNewLaunch = async (req, res) => {
  const launch = req.body;
  if (
    !launch.launchDate ||
    !launch.mission ||
    !launch.target ||
    !launch.rocket
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  launch.launchDate = new Date(launch.launchDate);
  console.log(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }
  //Alternate way
  // if (launch.launchDate.toString() === "Invalid Date") {
  //   return res.status(400).json({ error: "Invalid launch date" });
  // }

  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
};

async function httpAbortLaunch(req, res) {
  const flightNumber = req.params.id;
  console.log(flightNumber);
  const existsLaunch = await existsLaunchWithId(+flightNumber);
  if (!existsLaunch) {
    return res.status(404).json({ error: "Launch not found" });
  }
  const aborted = await abortLaunchById(+flightNumber);
  console.log(aborted);
  if (aborted.modifiedCount !== 1) {
    return res.status(400).json({ error: "Failed to abort launch" });
  }

  return res
    .status(200)
    .json({ ok: true, message: "Launch was successfully aborted" });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };

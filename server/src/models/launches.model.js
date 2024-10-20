const launches = new Map();
const Launches = require("./launches.mongo");
const Planets = require("./planets.mongo");
// const node_fetch = import("node-fetch");
const axios = require("axios");

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

const DEFAULT_FLIGHTNUMBER = 100;

// const launch = {
//   flightNumber: 100,
//   mission: "Kepler Exploration X",
//   rocket: "Explorer IS1",
//   launchDate: new Date("December 27, 2030"),
//   target: "Kepler-442 b",
//   customers: ["ZTM", "NASA"],
//   success: true,
//   upcoming: true,
// };

// async function populateLaunches() {
//   // console.log(await node_fetch);
//   const { default: fetch } = await node_fetch;
//   const res = await fetch(SPACEX_API_URL, {
//     method: "post",
//     body: JSON.stringify({
//       query: {},
//       options: {
//         // page: 5,
//         // limit: 20,
//         pagination: false,
//         populate: [
//           {
//             path: "rocket",
//             select: ["name"],
//           },
//           {
//             path: "payloads",
//             select: "customers",
//           },
//         ],
//       },
//     }),
//     headers: { "Content-Type": "application/json" },
//   });
//   if (!res.ok) {
//     console.error("Problem downloading launches from database");
//     throw new Error(`Launches data download failed`);
//   }
//   const data = await res.json();

//   const launchDocs = data.docs;
//   for (const launchDoc of launchDocs) {
//     const payloads = launchDoc["payloads"];
//     const customers = payloads.flatMap((payload) => {
//       return payload["customers"];
//     });

//     // const payloads = launchDoc["payloads"];

//     // const customers = payloads.reduce((acc, cur) => {

//     //   acc.push(cur.customers.join(","));
//     //   return acc;
//     // }, []);

//     const launch = {
//       flightNumber: launchDoc["flight_number"],
//       mission: launchDoc["name"],
//       rocket: launchDoc["rocket"]["name"],
//       launchDate: launchDoc["date_local"],
//       upcoming: launchDoc["upcoming"],
//       success: launchDoc["success"] || true,
//       customers,
//     };

//     console.log(
//       `${launch.flightNumber} | ${launch.mission} | ${launch.customers}`
//     );
//     await saveLaunch(launch);
//   }
// }

async function populateLaunches() {
  // console.log(await node_fetch);
  const res = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // page: 5,
      // limit: 20,
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: ["name"],
        },
        {
          path: "payloads",
          select: "customers",
        },
      ],
    },
  });
  if (!res.ok) {
    console.error("Problem downloading launches from database");
    throw new Error(`Launches data download failed`);
  }
  const data = await res.data;

  const launchDocs = data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    // const payloads = launchDoc["payloads"];
    // const customers = payloads.reduce((acc, cur) => {
    //   acc.push(cur.customers.join(","));
    //   return acc;
    // }, []);

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"] || true,
      customers,
    };

    console.log(
      `${launch.flightNumber} | ${launch.mission} | ${launch.customers}`
    );
    await saveLaunch(launch);
  }
}

async function firstLaunch(query) {
  return await Launches.findOne(query);
}

async function loadLaunchesData() {
  const alreadyLoaded = await firstLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (alreadyLoaded) {
    console.log("Launches data already loaded.");
    return;
  } else {
    await populateLaunches();
  }
}

// launches.set(launch.flightNumber, launch);

async function getLatestFlightNumber() {
  const latestLuanch = await Launches.findOne().sort("-flightNumber");
  if (!latestLuanch) {
    return DEFAULT_FLIGHTNUMBER;
  }
  return latestLuanch.flightNumber;
}

async function saveLaunch(launch) {
  await Launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );
}

// let latestFlightNumber = 100;

// function addNewLaunch(launch) {
//   latestFlightNumber += 1;
//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       flightNumber: latestFlightNumber,
//       upcoming: true,
//       launchDate: new Date(launch.launchDate),
//       customers: ["Zero to Mastery", "NASA"],
//       success: true,
//     })
//   );
// }

// function getAllLaunches() {
//   return Array.from(launches.values());
// }

async function scheduleNewLaunch(launch) {
  const existingPlanet = await Planets.findOne({ keplerName: launch.target });
  if (!existingPlanet) {
    throw new Error("Couldn't find planet ");
  }
  const newLaunchFlightNumber = (await getLatestFlightNumber()) + 1;
  console.log(newLaunchFlightNumber);

  const newLaunch = Object.assign(launch, {
    flightNumber: newLaunchFlightNumber,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    success: true,
  });
  await saveLaunch(newLaunch);
}

async function getAllLaunches({ skip, limit }) {
  return await Launches.find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

function existsLaunchWithId(launchId) {
  return Launches.findOne({ flightNumber: launchId });
}

async function abortLaunchById(launchId) {
  const aborted = await Launches.updateOne(
    { flightNumber: launchId },
    { success: false, upcoming: false }
  );
  if (!aborted) {
    throw new Error(`Launch with id ${launchId} not found`);
  }

  return aborted;
}

module.exports = {
  loadLaunchesData,
  scheduleNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
};

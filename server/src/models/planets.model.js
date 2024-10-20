const { parse } = require("csv-parse");
const { open } = require("node:fs/promises");
const path = require("node:path");
const fs = require("fs");
const EventEmitter = require("node:events");
const emitter = new EventEmitter();
const Planets = require("./planets.mongo");
const { log } = require("node:console");

async function loadPlanets() {
  const fileHandle = await open(
    path.join(__dirname, "../", "data", "/kepler_data.csv"),
    "r"
  );
  const stream = fileHandle.createReadStream();

  function isHabitablePlanet(planet) {
    return (
      planet["koi_disposition"] === "CONFIRMED" &&
      planet["koi_insol"] < 1.11 &&
      planet["koi_insol"] > 0.36 &&
      planet["koi_prad"] < 1.6
    );
  }

  return new Promise((resolve, reject) => {
    stream
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanets(data);
        }
      })
      .on("error", async (err) => {
        console.error("Error:", err);
        await fileHandle.close();
        reject(err);
      })
      .on("end", async () => {
        try {
          console.log("Stream read complete");
          // const allPlanets = await Planets.find({});
          // console.log(`Habitable Planets: ${allPlanets.length}`);
          await fileHandle.close();
        } catch (error) {
          console.error(`Error: ${error}`);
        } finally {
          resolve(await Planets.find({}));
        }
      });
  });
}

async function getAllPlanets() {
  return await Planets.find({}, {_id: 0, __v: 0});
}

async function savePlanets(planet) {
  // try {
  //   return await Planets.updateOne({ keplerName: planet.kepler_name },{ keplerName: planet.kepler_name },{upsert: true})
  // } catch (error) {
  //   console.error(`Could not save planets: ${error.message}`);

  // }
  try {
    const existingPlanet = await Planets.findOne({
      keplerName: planet.kepler_name,
    });
    if (existingPlanet) {
      return;
    }
    const newPlanet = await Planets.create({ keplerName: planet.kepler_name });
    return newPlanet;
  } catch (error) {
    console.error(error);
  }
}

/*
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanets() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "../", "data", "/kepler_data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log(
          habitablePlanets.map((planet) => {
            return planet["kepler_name"];
          })
        );
        console.log(`${habitablePlanets.length} habitable planets found!`);
        resolve();
      });
  });
}
  */

// const { EventEmitter } = require('events');
// const fs = require('fs');
// const path = require('path');
// const { parse } = require('csv-parse');
// const { open } = require('fs/promises'); // Using fs.promises for opening the file

// const emitter = new EventEmitter();

// async function loadPlanets() {
//   const habitablePlanets = [];
//   const fileHandle = await open(
//     path.join(__dirname, "../", "data", "/kepler_data.csv"),
//     "r"
//   );
//   const stream = fileHandle.createReadStream();

//   function isHabitablePlanet(planet) {
//     return (
//       planet["koi_disposition"] === "CONFIRMED" &&
//       planet["koi_insol"] < 1.11 &&
//       planet["koi_insol"] > 0.36 &&
//       planet["koi_prad"] < 1.6
//     );
//   }

//   stream
//     .pipe(
//       parse({
//         comment: "#",
//         columns: true,
//       })
//     )
//     .on("data", (data) => {
//       if (isHabitablePlanet(data)) {
//         habitablePlanets.push(data);
//       }
//     })
//     .on("error", (err) => {
//       console.error("Error:", err);
//       fileHandle.close();
//     })
//     .on("end", () => {
//       console.log("Stream read complete");
//       console.log(
//         habitablePlanets.map((planet) => planet["kepler_name"])
//       );
//       console.log(`Habitable Planets: ${habitablePlanets.length}`);
//       fileHandle.close();

//       // Emit an event to signal that the planets are loaded
//       emitter.emit('planetsLoaded', habitablePlanets);
//     });
// }

// // Function to start the server (you can replace this with your actual server code)
// function startServer() {
//   console.log("Starting server...");
//   // Server initialization code here
//   // e.g., app.listen(port, () => console.log(`Server listening on port ${port}`));
// }

// // Event listener that waits for the planets to be loaded before starting the server
// emitter.on('planetsLoaded', (planets) => {
//   console.log('Planets loaded successfully!');
//   console.log(planets); // You can access the habitable planets array here if needed
//   startServer(); // Start the server once planets are loaded
// });

// // Load planets and wait for the 'planetsLoaded' event before starting the server
// async function initializeApp() {
//   await loadPlanets();
// }

// initializeApp();

module.exports = {
  getAllPlanets,
  loadPlanets,
};

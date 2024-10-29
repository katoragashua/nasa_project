const request = require("supertest");
const app = require("../app");
const { connectDB, disconnectDB } = require("../db/connectDB");
const { loadPlanets } = require("../models/planets.model");

describe("Launches API", () => {
  beforeAll(async () => {
    await connectDB();
    await loadPlanets()
  });
  afterAll(async () => {
    await disconnectDB();
  });

  describe("Test GET /v1/launches", () => {
    test("it should respond with a 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200); //A longer method
    });
  });

  describe("Test POST /v1/launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      launchDate: "December 25, 2030",
      target: "Kepler-442 b",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-442 b",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-442 b",
      launchDate: "invalid date",
    };

    test("it should respond with a 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);

      // expect(response).toBe(201); //A longer method
    });
    test("it should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({ error: "Missing required fields" });
    });
    test("it should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({ error: "Invalid launch date" });
    });
  });
});

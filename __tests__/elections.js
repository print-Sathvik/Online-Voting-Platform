const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
// eslint-disable-next-line no-unused-vars
const { Admin, Election, Voter, Question, Option } = require("../models");
const app = require("../app");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

// eslint-disable-next-line no-unused-vars
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Online Voting", function () {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      server = app.listen(3052, () => {});
      agent = request.agent(server);
    } catch (er) {
      console.log("******************************************", er);
    }
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(
        "::::::::::::::::::::::::::::::::::::::::::::::::::::::",
        error
      );
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/admin").send({
      firstName: "Test First Name",
      lastName: "Test Last Name",
      email: "testuser@testmail.com",
      password: "testpassword123",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign out", async () => {
    let response = await agent.get("/elections");
    expect(response.statusCode).toBe(200);
    response = await agent.get("/signout");
    expect(response.statusCode).toBe(302);
    response = await agent.get("/elections");
    expect(response.statusCode).toBe(302);
  });
});

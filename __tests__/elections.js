const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
// eslint-disable-next-line no-unused-vars
const {
  Admin,
  Election,
  Voter,
  Question,
  Option,
  Response,
} = require("../models");
const app = require("../app");
const { application } = require("express");
const { json } = require("sequelize");

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
      console.log(er);
    }
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
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

  test("Create an election with given title", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@testmail.com", "testpassword123");
    let res = await agent.get("/elections");
    let csrfToken = extractCsrfToken(res);
    const newElection = await agent
      .post("/elections")
      .send({
        title: "Test Election Title",
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(newElection.text);
    expect(parsedResponse.title).toBe("Test Election Title");
    expect(parsedResponse.started).toBe(false);
    expect(parsedResponse.ended).toBe(false);
  });

  test("Start an election, change not started -> started", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@testmail.com", "testpassword123");
    let res = await agent.get("/elections");
    let csrfToken = extractCsrfToken(res);
    const newElection = await agent
      .post("/elections")
      .send({
        title: "Test Election Title",
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(newElection.text);
    const electionId = parsedResponse.id;
    let election = await Election.findByPk(electionId);
    expect(election.started).toBe(false);
    expect(election.ended).toBe(false);

    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    await agent.put(`/elections/manage/${electionId}/changeStatus`).send({
      _csrf: csrfToken,
    });
    election = await Election.findByPk(electionId);
    expect(election.started).toBe(true);
    expect(election.ended).toBe(false);
  });

  test("End an election, change started -> ended", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@testmail.com", "testpassword123");
    let res = await agent.get("/elections");
    let csrfToken = extractCsrfToken(res);
    const newElection = await agent
      .post("/elections")
      .send({
        title: "Test Election Title",
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(newElection.text);
    const electionId = parsedResponse.id;
    let election = await Election.findByPk(electionId);
    expect(election.started).toBe(false);
    expect(election.ended).toBe(false);

    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    await agent.put(`/elections/manage/${electionId}/changeStatus`).send({
      _csrf: csrfToken,
    });
    election = await Election.findByPk(electionId);
    expect(election.started).toBe(true);
    expect(election.ended).toBe(false);

    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    await agent.put(`/elections/manage/${electionId}/changeStatus`).send({
      _csrf: csrfToken,
    });
    election = await Election.findByPk(electionId);
    expect(election.started).toBe(true);
    expect(election.ended).toBe(true);
  });

  test("Add voter to an election", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@testmail.com", "testpassword123");
    let res = await agent.get("/elections");
    let csrfToken = extractCsrfToken(res);
    const newElection = await agent
      .post("/elections")
      .send({
        title: "Test Election Title",
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(newElection.text);
    const electionId = parsedResponse.id;

    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    const newVoter = await agent
      .post("/addVoter")
      .send({
        voterId: "Test Voter",
        password: "test password",
        electionId: electionId,
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedNewVoter = JSON.parse(newVoter.text);
    expect(parsedNewVoter.voterId).toBe("Test Voter");
  });

  test("Add question to an election", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@testmail.com", "testpassword123");
    let res = await agent.get("/elections");
    let csrfToken = extractCsrfToken(res);
    const newElection = await agent
      .post("/elections")
      .send({
        title: "Test Election Title",
        _csrf: csrfToken,
      })
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(newElection.text);
    const electionId = parsedResponse.id;

    res = await agent.get("/elections");
    csrfToken = extractCsrfToken(res);
    const response = await agent.post("/addQuestion").send({
      title: "Question 1",
      description: "Description for question 1",
      electionId: electionId,
      option1: "option 1",
      option2: "option 2",
      option3: "option 3",
      _csrf: csrfToken,
    });

    const newQuestion = await Question.findOne({
      where: {
        electionId: electionId,
      },
    });
    const options = await Option.findAll({
      where: { questionId: newQuestion.id },
    });
    expect(newQuestion.title).toBe("Question 1");
    expect(newQuestion.description).toBe("Description for question 1");
    expect(newQuestion.electionId).toBe(electionId);
    expect(options[0].option).toBe("option 1");
    expect(options[1].option).toBe("option 2");
    expect(options[2].option).toBe("option 3");
  });
});

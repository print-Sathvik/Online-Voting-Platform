/* eslint-disable no-unused-vars */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Admin, Election, Voter, ElectionVoter, Question } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(bodyParser.json());
const path = require("path");
// eslint-disable-next-line no-unused-vars
const { response } = require("express");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("A secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//Setting EJS as view engine
app.set("view engine", "ejs");

//Location of static html and CSS files to render our application
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "secret-key for session 123abc",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //in milli seconds
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(
  "AdminAuthenticate",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      Admin.findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch(() => {
          return done(null, false, { message: "User does not exist" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serialising user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Admin.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Voting Application",
    csrfToken: request.csrfToken(),
  });
});

app.get("/signup", async (request, response) => {
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/admin", async (request, response) => {
  if (request.body.firstName.trim().length === 0) {
    request.flash("error", "First name is mandatory");
    return response.redirect("/signup");
  }
  if (request.body.email.trim().length === 0) {
    request.flash("error", "Email ID is a mandatory field");
    return response.redirect("/signup");
  }
  if (request.body.password.length < 5) {
    request.flash("error", "Password should be of atleast 5 characters");
    return response.redirect("/signup");
  }
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const existingEmail = await Admin.findOne({
      where: { email: request.body.email },
    });
    if (existingEmail !== null) {
      throw "User already exists";
    }
    const user = await Admin.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPassword,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
        response.redirect("/signup");
      }
      response.redirect("/elections");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "User already exists. Please Login");
    response.redirect("/login");
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("AdminAuthenticate", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    response.redirect("/elections");
  }
);

app.get(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const allElections = await Election.getElections(loggedInUser);
    if (request.accepts("html")) {
      response.render("electionsAdminHome", {
        title: "Voting Application",
        allElections,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        allElections,
      });
    }
  }
);

app.post(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    if (request.body.title.trim().length === 0) {
      request.flash("error", "Title cannot be empty");
      return response.redirect("/todos");
    }
    try {
      const election = await Election.addElection({
        title: request.body.title,
        started: false,
        ended: false,
        adminId: request.user.id,
      });
      if (request.accepts("html")) {
        return response.redirect("/elections");
      } else {
        return response.json(election);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.delete(
  "/elections/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      console.log(request.body);
      await Election.remove(request.params.id, request.user.id); //Added user id to check who is deleting
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);

//To change election from Not started -> Started -> Ended
app.put(
  "/elections/manage/:id/changeStatus",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    try {
      const updatedElection = await election.changeStatus(
        election.id,
        election.started,
        election.ended
      );
      return response.json(updatedElection);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

//Manage a specific election after clicking on 'Manage' in the list of elections page
app.get(
  "/elections/manage/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const election = await Election.findByPk(request.params.id);
    response.render("manageElection", {
      title: "Manage",
      electionTitle: election.title,
      electionId: request.params.id,
      csrfToken: request.csrfToken(),
    });
  }
);

app.get(
  "/elections/manage/:id/manageVoters",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const electionId = request.params.id;
    const voterTableIds = await ElectionVoter.getVoters(electionId);
    const allVoters = await Voter.getVoters(voterTableIds);
    response.render("manageVoters", {
      electionId: electionId,
      allVoters,
      csrfToken: request.csrfToken(),
    });
  }
);

//Add Voters for a particular election
app.post(
  "/addVoter",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
    try {
      const user = await Voter.create({
        voterId: request.body.voterId,
        password: hashedPassword,
      });
      console.log(user);
      await ElectionVoter.create({
        electionId: request.body.electionId,
        voterId: user.id,
      });
      return response.redirect(
        `/elections/manage/${request.body.electionId}/manageVoters`
      );
    } catch (error) {
      console.log(error);
      request.flash(
        "error",
        "This voter ID already exists, please give a diferent ID"
      );
      response.redirect(
        `/elections/manage/${request.body.electionId}/manageVoters`
      );
    }
  }
);

app.get(
  "/elections/manage/:id/newQuestion",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const electionId = request.params.id;
    const questions = await Question.getQuestions(electionId);
    response.render("addQuestion", {
      electionId,
      questions,
      csrfToken: request.csrfToken(),
    });
  }
);

app.post(
  "/addQuestion",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const question = await Question.create({
        title: request.body.title,
        description: request.body.description,
        electionId: request.body.electionId,
      });
      console.log(question);
      request.flash("message", "Question added Successfully");
      return response.redirect(
        `/elections/manage/${request.body.electionId}/manageQuestions`
      );
    } catch (error) {
      console.log(error);
      response.redirect(
        `/elections/manage/${request.body.electionId}/manageQuestions`
      );
    }
  }
);

app.get(
  "/elections/manage/:id/manageQuestions",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const electionId = request.params.id;
    const questions = await Question.getQuestions(electionId);
    response.render("manageQuestions", {
      electionId,
      questions,
      csrfToken: request.csrfToken(),
    });
  }
);

module.exports = app;

const express = require("express");
const app = express();
const cors = require("cors");
var dotenv = require("dotenv");
var bodyParser = require("body-parser");
const passport = require("passport");
const users = require("../routes/api/users");

require("../config/passport")(passport); // Routes

dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // image thingg
app.use(bodyParser.json({ limit: "50mb", extended: true })); // image thingg
app.use(passport.initialize()); // Passport config
app.use("/api/user", users);
const routes = require("../routes/routes");
app.use("/api", routes);

// Initialize CORS middleware
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// ----------------------   CRUD    ----------------------------------------
// ----------------------   CRUD    ----------------------------------------
app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

const port = process.env.PORT || 3001;
module.exports = { app, port };

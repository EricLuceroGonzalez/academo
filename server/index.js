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
app.use(passport.initialize()); // Passport config
app.use("/api/users", users);

// ----------------------   CRUD    ----------------------------------------
// ----------------------   CRUD    ----------------------------------------
app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

const port = process.env.PORT || 3000;
module.exports = { app, port };

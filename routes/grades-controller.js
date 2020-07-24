const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");

getAllUsers = async (req, res, next) => {
  console.time("start");
  console.log("in here getAllUsers");

  let allUsers;
  try {
    allUsers = await User.find();
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor regístrate",
      403
    );
    return next(error);
  }
  res.status(200).send(allUsers);
    console.timeEnd("start");
};

module.exports = { getAllUsers };

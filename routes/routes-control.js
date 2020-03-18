// For Login and Register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const User = require("../models/User");

postExam = (req, res) => {
  newExam = new User(req.body);
  console.log(newExam);
  User.findByIdAndUpdate(req.body.id, { points: req.body.points })
    .then(() => {
      return res.status(200).json({
        success: true,
        message: "Submitted!"
      });
    })
    .catch(error => {
      return res.status(400).json({
        error,
        message: "not created!"
      });
    });
};
module.exports = { postExam };

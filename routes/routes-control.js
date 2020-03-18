// For Login and Register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const User = require("../models/User");

// Import nodemailer
var nodemailer = require("nodemailer");
// Define transporter to login to mail sender account
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mailUser,
    pass: process.env.mailPass
  }
});

postExam = (req, res) => {
  newExam = new User(req.body);
  console.log(newExam);

  User.findOneAndUpdate(
    req.body.id,
    {
      $push: {
        testInfo: {
          examDate: Date.now(),
          points: req.body.points,
          grade: req.body.grade
        }
      }
    },
    { new: true }
  )
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Submitted!"
      });
      transporter.sendMail({
        from: process.env.mailUser, // sender address
        to: "ericlucerogonzalez@gmail.com", // list of receivers
        subject: `id: ${req.body.id}, calificacion: ${req.body.grade * 100}`, // Subject line
        html: `<p>Hello Eric. id: ${req.body.id} ha obtenido una calificacion de ${req.body.grade * 100}</p>` // html body
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

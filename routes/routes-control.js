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

// mongoose.set('useFindAndModify', false);

postExam = (req, res) => {
  newExam = new User(req.body);
  console.log(newExam);

  User.findOneAndUpdate(
    { _id: req.body.theId },
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
        subject: `Hola, ${req.body.theName}, tu calificacion:`, // Subject line
        html: `<div>Hola, <b>${req.body.theName}</b>, 
        <div>tu id: ${
          req.body.theId
        }</div> <div>Has obtenido una calificacion de ${req.body.grade.toFixed(
          2
        )}</div>
        </div>` // html body
      });
    })
    .catch(error => {
      return res.status(400).json({
        error,
        message: "not created!"
      });
    });
};

getGrades = (req, res) => {
  User.find()
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => res.status(400).send(err));
};

module.exports = { postExam, getGrades };

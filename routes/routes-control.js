// For Login and Register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const User = require("../models/User");
const Test = require("../models/Test");
const Courses = require("../models/Courses");
// Import nodemailer
var nodemailer = require("nodemailer");
// Define transporter to login to mail sender account
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mailUser,
    pass: process.env.mailPass,
  },
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
          grade: req.body.grade,
        },
      },
    },
    { new: true }
  )
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Submitted!",
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
        </div>`, // html body
      });
    })
    .catch((error) => {
      return res.status(400).json({
        error,
        message: "not created!",
      });
    });
};

// To post a test:
postTest = (req, res) => {
  newTest = new Test(req.body);
  newTest
    .save()
    .then((theTest) => {
      console.log(`The test: \n ${theTest._id} \n ${theTest.subject}`);

      Courses.findOneAndUpdate(
        { _id: theTest.subject },
        { $push: { tests: theTest.id } }
      )
        .then((subjc) => console.log(`Subjc added: ${subjc}`))
        .catch((err) => console.log(`Subjc err: ${err}`));

      res.status(200).json({
        success: true,
        message: `Test ${theTest.id} Submitted!`,
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: `Error on saving! \n ${err}`,
      });
    });
};

postCourse = (req, res) => {
  console.log(req.bodycl);
  newCourse = new Courses(req.body);

  newCourse
    .save()
    .then(
      res.status(200).json({
        success: true,
        message: "Submitted!",
      })
    )
    .catch(
      res.status(400).json({
        success: false,
        message: "Error on saving!",
      })
    );
};

getCourses = (req, res) => {
  Courses.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

getCourseDashboard = (req, res) => {
  let today = new Date();
  console.log(
    "1) " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds()
  );
  user = req.params.usr;

  Courses.find({ enroll: user })
    .populate("tests")
    .then((data) => {
      console.log(data);
      console.log(
        "2) " +
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds()
      );
      res.status(200).send(data);
      console.log(
        "3) " +
          today.getHours() +
          ":" +
          today.getMinutes() +
          ":" +
          today.getSeconds()
      );
    })
    .catch((err) => res.status(400).send(err));
};

getATest = (req, res) => {
  console.log(req.params.name);
  
  Test.findOne({ testName: req.params.name })
    .then((data) => {
      console.log(data);
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

getGrades = (req, res) => {
  User.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

module.exports = {
  getGrades,
  getCourses,
  postExam,
  postTest,
  postCourse,
  getCourseDashboard,
  getATest
};

// For Login and Register
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

postExam = async (req, res, next) => {
  // Check if the user creator already exists:
  // TODO:instead of 'const title = req.body.title' ... we do:
  // TODO:const { title, description, address, creator } = req.body;
  const {
    theName,
    theId,
    totalPts,
    testId,
    testName,
    grade,
    allAns,
    ansQuest,
  } = req.body;

  let user;
  let testCollection;
  try {
    user = await User.findById(theId);
    testCollection = await Test.findById(testId);
  } catch (err) {
    const error = new HttpError("The user or test is not registered.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }
  if (!testCollection) {
    const error = new HttpError("Could not find test for provided id.", 404);
    return next(error);
  }

  if (testCollection) {
    if (testCollection.users.length > 0) {
      let arr = [];
      let newId = testCollection.users.map((item) => {
        if (item == theId) {
          arr.push(item);
        }
      });

      if (arr.length === 0) {
        await Test.findByIdAndUpdate(testId, {
          $push: { users: theId },
        });
      }
    }
    if (testCollection.users.length === 0) {
      await Test.findByIdAndUpdate(testId, {
        $push: { users: theId },
      });
    }
  }

  // TestInfo to push on user:
  const testInfo = {
    test: testId,
    examDate: Date.now(),
    totalPts: totalPts,
    testName: testName,
    grade: grade,
    allAns: allAns,
    ansQuest: ansQuest,
  };

  const sendMail = async (user) => {
    await transporter.sendMail({
      from: process.env.mailUser, // sender address
      to: user.email, // list of receivers
      subject: `Academo. ${user.name.firstName}, hemos recibido tu calificacion 👍`, // Subject line
      html: `<h3
                  style="
                    text-shadow: 3px 2px 1px black;
                    color: white;
                    background-color: rgb(116, 35, 153);
                    font-weight: bold;
                    font-size: 1.25em;
                    padding: 7px 8px;
                    width: 97%;
                    box-shadow: 6px 6px aqua;
                  "
                >
                  Academo
                  <span role="img" aria-label="rocket">
                    🚀
                  </span>
                </h3>
                <div
                  style="
                    background-color: rgb(226, 225, 226);
                    border: 2px solid rgb(116, 35, 153);
                    width: 95%;
                    font-size: 1.15em;
                    font-weight: 700;
                    padding: 4px 12px;
                    color: rgb(116, 35, 153);
                  "
                >
                <div>Hola, <b>${user.name.firstName}</b>, hemos recibido el 
                <strong style="padding: 3px 6px; background-color: rgb(40, 210, 105);">${testName}</strong>
                </div>
                <div>Has obtenido una calificacion de 
                <strong style="padding: 3px 6px; background-color: rgb(40, 210, 105);">${grade}</strong>
                <span role="img" aria-label="${
                  grade < 60 ? "think-face" : "rocket"
                }"> ${grade < 60 ? "🤔" : "🚀"} </span>
                </div>
                </div>`,
    });
  };

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.testInfo.push(testInfo);
    await user.save({ session: sess }); // ---> Update now with the place
    await sess.commitTransaction(); // ---> Changes will commit
    sendMail(user);
    res.status(201).json({ message: "Test accepted" });
  } catch (err) {
    const error = new HttpError(
      "Creating place failed. Please try again.",
      500
    );
    res.status(500).json({ message: "Some error ocurred. Please try again." });
    return next(error);
  }
};

postCourse = (req, res) => {
  // console.log(req.body);

  newCourse = new Course( req.body);

  try {
    newCourse.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed. Please try again.",
      500
    );
    res.status(500).json({ message: "Some error ocurred. Please try again." });
    return next(error);
  }

  res.status(200).json({
    course: newCourse,
    message: "Course Submitted!",
  });
};

getCourses = (req, res) => {
  Course.find()
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

  Course.find({ enroll: user })
    .populate("tests")
    .then((data) => {
      // console.log(data);
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

// To post a test:
postNewTest = (req, res) => {
  newTest = new Test(req.body);
  newTest
    .save()
    .then((theTest) => {
      // console.log(`The test: \n ${theTest._id} \n ${theTest.subject}`);

      Course.findOneAndUpdate(
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

getATest = (req, res) => {
  // console.log(req.params.name);

  Test.findOne({ testName: req.params.name })
    .then((data) => {
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
  postCourse,
  postNewTest,
  getCourseDashboard,
  getATest,
};

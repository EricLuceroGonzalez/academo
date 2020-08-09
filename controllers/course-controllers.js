const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");


const postCourse = (req, res) => {
  // console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError("Invalid inputs, please check your data", 422);
    return next(error);
  }
  newCourse = new Course(req.body);

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

const getCourses = (req, res) => {
  Course.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

const getCourseDashboard = async (req, res, next) => {
  user = req.params.usr;
  // console.log(`user: ${user}`);

  let usrTests = [];
  try {
    courses = await Course.find({ enroll: user }).populate("tests");
    user = await User.findById(user);
    user.testInfo.map((item) => {
      // console.log(`usrTest: ${item.test}`);
      usrTests.push({ grd: item.grade, testId: item.test });
    });
    res.status(200).json({ allTests: courses[0], usrTests: usrTests });
  } catch (err) {
    // console.info("next()");
    res.status(400).send(err);
    next();
  }
};

exports.getCourseDashboard = getCourseDashboard;
exports.getCourses = getCourses;
exports.postCourse = postCourse;

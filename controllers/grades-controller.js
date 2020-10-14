const express = require("express");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");

getGrades = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  let courseName = req.params.courseName;
  let course;

  try {
    course = await Course.findOne({ courseName: courseName });
  } catch (err) {
    const error = new HttpError(
      "Este curso no ha sido hallado. Intenta de nuevo",
      422
    );
    return next(error);
  }

  if (!course) {
    const error = new HttpError("Intenta de nuevo. El curso no existe.", 422);
    return next(error);
  }
  let allUsers;
  try {
    allUsers = await User.find({ subject: course._id });
    res
      .status(200)
      .json({
        success: true,
        data: allUsers,
        testsLength: course.tests.length,
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `No course found! \n ${err}`,
    });
    next();
  }
};

getACourse = async (req, res, next) => {
  courseId = req.params.id;
  console.log(courseId);

  try {
    myCourse = await Course.findById(courseId);
    res.status(200).json({ tests: myCourse.tests });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `No course found! \n ${err}`,
    });
    next();
  }
};

getUserGrades = async (req, res, next) => {
  userId = req.params.id;
  // console.log(`userId: ${userId}`);
  let user;
  let testAnswers = [];
  user = await User.findById(userId);
  if (user) {
    ids = user.testInfo.map((item, i) => {
      // console.log(`test id: ${item.test}`);
      return item.test;
    });
    records = await Test.find().where("_id").in(ids).exec();
    if (records) {
      // let test = [{ name: '', amount: [], answers: [] }];
      records.map((item) => {
        let newTest = { name: "", amount: "", answers: [] };
        item.questions.map((item) => {
          newTest.answers.push(item.answer);
        });
        newTest.name = item.testName;
        newTest.amount = item.questions.length;
        testAnswers.push(newTest);
      });
    }
    try {
      res
        .status(200)
        .json({ testInfo: user.testInfo, testAnswers: testAnswers });
    } catch (err) {
      res.status(500).json({
        error:
          "Error 500. Try again. We cant return your grades at the moment.",
      });
    }
  }
};
module.exports = { getACourse, getGrades, getUserGrades };

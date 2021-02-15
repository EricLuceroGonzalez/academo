const express = require("express");
const router = express.Router();
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const { registerMail } = require("./sendMail-controller");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Survey = require("../models/Survey-model");
const Course = require("../models/Courses");

// @route POST api/users/register
// @desc Register user
// @access Public
const signup = async (req, res, next) => {
  //  console.log("\nbackend register");
  //  console.log(req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //  console.log(errors);

    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }
  const {
    firstName,
    lastName,
    email,
    password,
    password2,
    identification,
    subject,
  } = req.body;

  if (password !== password2) {
    const error = new HttpError("Las contraseñas no coinciden.", 500);
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Ocurrió un error al verificar el correo, inténtalo de nuevo.",
      500
    );
    return next(error);
  }
  if (existingUser) {
    const error = new HttpError(
      "Ya hay un usuario registrado con este correo. Por favor, inicia sesión.",
      422
    );
    return next(error);
  }

  // With bycrpt we HASH the password from incoming request:
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Hubo un error al encriptar la contraseña, por favor inténtalo de nuevo.",
      500
    );
    return next(error);
  }

  // Find the course this user is listed:
  let userSubject;
  try {
    userSubject = await Course.findOne({ courseName: subject });
  } catch (err) {
    const error = new HttpError(
      "El curso que has introducido no esta disponible, por favor inténtalo de nuevo.",
      500
    );
    return next(error);
  }
  // Create user:
  const createdUser = await new User({
    name: {
      firstName,
      lastName,
    },
    email,
    password: hashedPassword,
    identification,
    subject: userSubject._id,
  });

  //   Create USER ---> save() to Mongo, as async => await
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "No pudimos crear el usuario, por favor inténtalo de nuevo",
      500
    );
    return next(error);
  }

  try {
    await userSubject.enroll.push(createdUser._id);
    await userSubject.save();
  } catch (err) {
    const error = new HttpError(
      "No pudimos crear el usuario, por favor inténtalo de nuevo",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "30s" }
    );
  } catch (err) {
    const error = new HttpError(
      "El usuario ha sido creado, sin embargo hay un problema con tu navegador.",
      500
    );
    return next(error);
  }
  // Send Registration Mail
  await registerMail(createdUser, req.body.password);

  res.status(201).json({
    name: createdUser.firstName,
    userId: createdUser.id,
    token: token,
  });
};

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Ha ocurrido un error, por favor intentalo de nuevo",
      403
    );
    return next(error);
  }

  //   CHECK IF EMAIL IS CORRECT (dummy version)
  if (!existingUser) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor regístrate",
      403
    );
    return next(error);
  }

  // Check the password, compare to the encrypted and give a token
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "No pudimos verificar tus datos, por favor inténtalo de nuevo.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "La contraseña no es válida, por favor inténtalo de nuevo.",
      403
    );
    return next(error);
  }

  // Add this visit:
  try {
    await existingUser.updateOne({ $inc: { visits: 1 } });
    await existingUser.updateOne({ $currentDate: { lastEntry: true } });
  } catch (err) {
    const error = new HttpError("error on last date", 500);
    return next(error);
  }
  // generate TOKEN
  let token;
  try {
    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };
    token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1h" });
  } catch (err) {
    const error = new HttpError(
      "Hubo un error en el registro, por favor inténtalo de nuevo.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    name: existingUser.name.firstName,
    userId: existingUser.id,
    token: token,
  });
};

const getAllUsers = async (req, res, next) => {
  //  console.log("in here getAllUsers");

  let allUsers;
  try {
    allUsers = await User.find();
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor crea una cuenta",
      403
    );
    return next(error);
  }
  res.status(200).send(allUsers);
};

const getUserInfo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  let thisUser;
  try {
    thisUser = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor verifica la información.",
      403
    );
    return next(error);
  }
  if (!thisUser) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor verifica la información.",
      403
    );
    return next(error);
  }

  res.status(201).json({
    visits: thisUser.visits,
    lastEntry: thisUser.lastEntry,
    submitSurvey: thisUser.submitSurvey,
    courseClass: thisUser.courseClass,
    email: thisUser.email,
    name: thisUser.name,
    subject: thisUser.subject,
  });
};

const postSurvey = async (req, res, next) => {
  //  console.log("\n ---------------------------------");

  //  console.log("postSurvey");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  // Build file:
  const { filledBy, personal, academic, homeConnection, family } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOneAndUpdate(
      { _id: filledBy },
      { submitSurvey: true }
    );
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor regístrate",
      403
    );
    return next(error);
  }

  //   CHECK IF EMAIL IS CORRECT (dummy version)
  const surveyFile = new Survey({
    personal,
    academic,
    homeConnection,
    family,
  });

  if (existingUser) {
    try {
      await surveyFile.save();
    } catch (err) {
      const error = new HttpError(
        "Hubo un error guardando la encuesta, por favor inténtalo de nuevo",
        403
      );
      return next(error);
    }
  }

  res.status(200).json({ message: "Encuesta entregada!" });
};

const getUserById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }
  let existingUser;
  try {
    existingUser = await User.findById(req.params.uid);
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor regístrate",
      403
    );
    return next(error);
  }

  res.status(200).json({
    name: existingUser.name,
    id: existingUser._id,
    email: existingUser.email,
    identification: existingUser.identification,
  });
};

const updateUserData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  const { firstName, lastName, email, courseClass, identification } = req.body;

  let userToEdit;
  try {
    userToEdit = await User.findById(req.params.uid);
    console.log(userToEdit);
  } catch (err) {
    const error = new HttpError(
      "No pudimos encontrar este usuario, por favor regístrate",
      403
    );
    return next(error);
  }
  try {
    userToEdit.name.firstName = firstName;
    userToEdit.name.lastName = lastName;
    userToEdit.email = email;
    userToEdit.courseClass = courseClass;
    userToEdit.identification = identification;
  } catch (err) {
    const error = new HttpError(
      "No pudimos guardar los cambios, por favor regístrate",
      403
    );
    return next(error);
  }

  try {
    await userToEdit.save();
  } catch (err) {
    const error = new HttpError(
      "No pudimos guardar los cambios, por favor regístrate",
      403
    );
    return next(error);
  }
  res.status(200).json({ message: "Cambios guardados!" });
};

const getSurveys = async (req, res, next) => {
  // console.log("getSurveys");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  // get all surveys
  let allSurveys;
  let allUsersArray = [];
  try {
    allUsersArray = await User.find();
  } catch (err) {
    const error = new HttpError(
      "Hemos tenido un error buscando las encuestas. Intenta de nuevo",
      422
    );
    return next(error);
  }
  let userHaveFilled = [];
  let allUsers = allUsersArray.length;
  try {
    allSurveys = await Survey.find();
    userHaveFilled = allUsersArray.filter((item) => item.submitSurvey === true);
    res.status(200).json({
      message: "Cool!",
      allSurveys: allSurveys,
      users: allUsers,
      userHaveFilled: userHaveFilled.length,
    });
  } catch (err) {
    const error = new HttpError(
      "Ha ocurrido un error enviando los resultados. Intenta de nuevo",
      422
    );
    return next(error);
  }
};

exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserInfo = getUserInfo;
exports.postSurvey = postSurvey;
exports.getUserById = getUserById;
exports.updateUserData = updateUserData;
exports.getSurveys = getSurveys;

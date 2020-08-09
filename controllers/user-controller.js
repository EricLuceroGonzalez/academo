const express = require("express");
const router = express.Router();
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");

// @route POST api/users/register
// @desc Register user
// @access Public
const signup = async (req, res, next) => {
  // Form validation
  console.log("\nbackend register");
  console.log(req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);

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
      "Ocurrió un error al verificar el correo, intentalo de nuevo.",
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
      "Hubo un error al encriptar la contraseña, por favor intentalo de nuevo.",
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
      "El curso que has introducido no esta disponible, por favor intentalo de nuevo.",
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
    const session = await mongoose.startSession();
    session.startTransaction();
    await userSubject.enroll.push(createdUser._id);
    await createdUser.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating user failed, please try again", 500);
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "3s" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  // Define transporter to login to mail sender account
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.mailUser,
      pass: process.env.mailPas,
    },
  });
  // NodeMail Send:
  await transporter.sendMail(
    {
      from: process.env.mailUser, // sender address
      to: email, // list of receivers
      subject: `Academo.xyz | Gracias ${firstName}. Tu cuenta se ha creado.`, // Subject line
      html: `<h3
      style="
        color: white;
        background-color: rgb(156, 0, 228);
        font-weight: bold;
        padding: 5rem 2rem;
        font-size: 3rem;
        width: 100%;
      "
    >
    <span role="img" aria-label="rocket">
    🚀
  </span>
      Academo.xyz
    </h3>
    <div
      style="
        font-family: Haettenschweiler, 'Arial Narrow Bold', sans-serif;
        background-color: rgb(241, 241, 241);
        border: 7px solid rgb(156, 0, 228);
        width: 100%;
        font-size: 1.45rem;
        padding: 4rem 1.25rem;
      "
    >
      <div>
        Hola,
        <strong style="background-color: rgb(40, 210, 105);"> ${firstName},</strong>
      </div>
      <div>
        Tu cuenta en <a href="https://www.academo.xyz">academo.xyz</a> ha sido
        registrada.
        <span role="img" aria-label="rocket">
          ✅
        </span>
      </div>
      <div>
        Tu contraseña es:<strong style="background-color: rgb(40, 210, 105);"
          >${password}</strong
        >
        <span role="img" aria-label="rocket">
          🔑
        </span>
      </div>
      <div style="margin-top: 3rem;">
        En <a href="https://www.academo.xyz">academo.xyz</a> podrás:
        <ol>
          <li>
            Hacer los talleres a tu tiempo.
            <span role="img" aria-label="rocket">
              ⏱️
            </span>
          </li>
          <li>
            Conocer instantáneamente tus respuestas.
            <span role="img" aria-label="rocket">
              ⚡
            </span>
          </li>
          <li>
            Corregir las veces que el sistema lo permita.
            <span role="img" aria-label="rocket">
              🐙
            </span>
          </li>
          <li>
            Saber tus calificaciones a tiempo.
            <span role="img" aria-label="rocket">
              📅
            </span>
          </li>
          <li>
            Ingresar a tu cuenta personal desde tu computadora o desde tu celular.
            <span role="img" aria-label="rocket">
              📱
            </span>
          </li>
        </ol>
      </div>
      <div style="margin-top: 33%;">
        <p>Gracias por crear tu cuenta.</p>
      </div>
      <div style="margin-top: 12%; color: rgb(116, 35, 153);">
        <p>Cualquier consulta escribe al correo:</p>
        <p>
          ericlucero501@gmail.com
        </p>
      </div>
    </div>`,
    },
    (error, info) => {}
  );

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
  console.log(`login!`);

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
      "No pudimos encontrar este usuario, por favor regístrate",
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
    await existingUser.update({ $inc: { visits: 1 } });
    await existingUser.update({ $currentDate: { lastEntry: true } });
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
  console.time("start");
  console.log("in here getAllUsers");

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
  console.timeEnd("start");
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
    email: thisUser.email,
    name: thisUser.name,
  });
};

exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserInfo = getUserInfo;

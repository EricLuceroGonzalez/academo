const express = require("express");
const router = express.Router();
const moment = require("moment");
moment.locale("es");
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Course = require("../models/Courses");

// Import nodemailer
var nodemailer = require("nodemailer");
// Define transporter to login to mail sender account
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mailUser,
    pass: process.env.mailPas,
  },
});

const visitsMail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //  console.log(errors);

    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }
};

const lowTestsMail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //  console.log(errors);

    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  //   Find users under 7 tests
  let usersLowTest;
  try {
    usersLowTest = await User.find();
  } catch (err) {
    const error = new HttpError("No hay usuarios con esta clase", 422);
    return next(error);
  }

  try {
    usersLowTest.map(async (user) => {
      if (user.testInfo.length < 7) {
        console.log(
          `tests: ${user.testInfo.length}, name: ${user.name.firstName}, Last entry: ${user.lastEntry}`
        );
        try {
          await transporter.sendMail({
            from: process.env.mailUser, // sender address
            to: user.email, // list of receivers/
            subject: `Hola, ${user.name.firstName}, recuerda hacer los talleres.`, // Subject line
            html: `<!DOCTYPE html>
          <html lang="en">
            <body>
              <div style="max-width: 65%; margin: 10px auto;">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,900&display=swap');
                  </style> 
                <h3
                  style="
                    text-shadow: 3px 2px 1px black;
                    color: white;
                    background-color: #7d64ff;
                    font-weight: bold;
                    font-size: 1.5em;
                    padding: 22px 28px;
                    width: 97%;
                    box-shadow: 3px 3px aqua;
                  "
                >
                  Academo
                </h3>
                <div
                style="
                  background-color: rgb(226, 225, 226);
                  border: 2px solid #7d64ff;
                  width: 95%;
                  font-size: 1.15em;
                  font-weight: 700;
                  padding: 2rem 2.5rem;
                  color: #7d64ff;
                "
              >
              <div>Hola, <b style="padding: 3px 1px; color: rgb(58, 55, 241);">${
                user.name.firstName
              }</b>.
                Si estas recibiendo este correo, probablemente necesites visitar Academo pronto.
                <br>
              Hemos notado que has entrado unas 
              <strong style="padding: 3px 2px; color: rgb(58, 55, 241);">${
                user.visits
              }</strong>
               veces a la plataforma.
               <br>
              La ultima visita fue
              <strong style="padding: 3px 2px; color: rgb(58, 55, 241);">${moment(
                user.lastEntry
              )
                .startOf("hour")
                .fromNow()}</strong>
              <br>
            <br>
              En total, tienes 
              <strong style="padding: 3px 2px; color: rgb(58, 55, 241);">${
                user.testInfo.length
              }</strong>
              talleres realizados, lo cual implica que debes hacer los que faltan, antes de la proxima semana.
    
              </div>
              <div style="margin-top: 30px;">
    Recuerda que las notas de estos talleres forman un tercio de la nota total del curso.
    Si tienes algún impedimento para resolverlos, responde este email con tus dudas.
              </div>
              </div>
              <div style="text-align: center; margin: 40px auto 80px auto;">
                <img
                width="120px"
                alt="academo logo is an A in a circle with an arrow"
                src="https://res.cloudinary.com/dcvnw6hvt/image/upload/v1599179407/Academo/Identidy/academoLogoC_oxeawu.png">
              </div>
            </div>
            </body>
          </html>`,
          });
        } catch (err) {
          const error = new HttpError("Error al enviar el correo masivo", 422);
          return next(error);
        }
      }
    });
  } catch (err) {
    const error = new HttpError("No hay usuarios con esta clase", 422);
    return next(error);
  }

  res.status(200).json({ message: "cool!", data: usersLowTest });
};

exports.visitsMail = visitsMail;
exports.lowTestsMail = lowTestsMail;

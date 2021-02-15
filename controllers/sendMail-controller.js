const express = require("express");
// Nodemailer init:
const nodemailer = require("nodemailer");
const HttpError = require("../models/http-error");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mailUser,
    pass: process.env.mailPas,
  },
});

const testMail = async (user, grade, testName) => {
  transporter.sendMail({
    from: process.env.mailUser, // sender address
    to: user.email, // list of receivers/
    subject: `Hola. ${user.name.firstName}, hemos recibido tu calificación 👍`, // Subject line
    html: `<!DOCTYPE html>
    <html lang="en">
    <body>
        <div style="max-width: 85%; margin: 10px auto;">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,900&display=swap');
            </style>
            <h3 style="
                    text-shadow: 3px 2px 1px black;
                    color: white;
                    background-color: #7d64ff;
                    font-weight: bold;
                    font-size: 1.5em;
                    padding: 27px 28px;
                    box-shadow: 3px 3px #57FFB3;
                    font-family: 'Montserrat', sans-serif;
                  ">
                Academo<span style="color:aquamarine;">.xyz</span>
            </h3>
            <div style="
                  background-color: rgba(226, 225, 226, 0.5);
                  border: 3px solid #7d64ff;
                  font-size: 1.25em;
                  font-weight: 700;
                  padding: 3rem 1rem;
                  color: #7d64ff;
                  font-family: 'Montserrat', sans-serif;
                ">
                <div>Hola, <b>${user.name.firstName}</b>, hemos recibido el
                    <strong style="padding: 3px 6px; background-color: #57FFB3;">${testName}</strong>
                </div>
                <div style="margin-top: 80px;">Has obtenido una calificación de:
                    <div style="font-size: 2rem; text-align: center;">
                        <strong style="padding: 3px 6px; background-color: #57FFB3;">${grade}</strong>
                        <span role="img" aria-label="${
                          grade < 60 ? " think-face " : "rocket "
                        }"> ${grade < 60 ? "🤔" : "🚀"} </span>
                    </div>
                </div>
                <div style="text-align: center; margin: 90px auto 80px auto;">
                    <img width="90px" alt="academo logo is an A in a circle with an arrow" src="https://res.cloudinary.com/dcvnw6hvt/image/upload/v1599179407/Academo/Identidy/academoLogoC_oxeawu.png">
                </div>
            </div>
        </div>
    </body>
    
    </html>`,
  });
};

const registerMail = async (user,passwrd) => {
  // NodeMail Send:
  transporter.sendMail({
    from: process.env.mailUser, // sender address
    to: user.email, // list of receivers
    subject: `Academo.xyz | Gracias ${user.name.firstName}. Tu cuenta se ha creado. 😊`, // Subject line
    html: `<!DOCTYPE html>
      <html lang="en">
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@1,900&display=swap');
      </style>
      
      <body>
          <div style="min-width: 85%">
              <h3 style="
                color: white;
                background-color: #7d64ff;
                font-weight: bold;
                padding: 3rem 2rem;
                font-size: 2rem;
                font-family: 'Montserrat', sans-serif;
              ">
                  Academo<span style="color:#57FFB3;">.xyz</span>
                  <span role="img" aria-label="rocket"> 🚀 </span>
              </h3>
              <div style="
                font-family: Haettenschweiler, 'Arial Narrow Bold', sans-serif;
                background-color: rgba(241, 241, 241,0.6);
                border: 4px solid #7d64ff;
                font-size: 0.75rem;
                padding: 4rem 2rem;
              ">
                  <div>
                      Hola,
                      <strong style="background-color: #57FFB3; padding: 3px 12px">
                  ${user.name.firstName},</strong
                >
              </div>
              <div>
                Tu cuenta en <a href="https://www.academo.xyz">academo.xyz</a> ha sido
                registrada.
                <span role="img" aria-label="rocket"> ✅ </span>
              </div>
              <div>
                Tu contraseña es:<strong
                  style="background-color: #57FFB3; padding: 3px 12px"
                  >${passwrd}</strong
                >
                <span role="img" aria-label="rocket"> 🔑 </span>
              </div>
              <div style="margin-top: 3rem">
                En <a href="https://www.academo.xyz">academo.xyz</a> podrás:
                <ol>
                  <li>
                    Hacer los talleres a tu tiempo.
                    <span role="img" aria-label="rocket"> ⏱️ </span>
                  </li>
                  <li>
                    Conocer instantáneamente tus respuestas.
                    <span role="img" aria-label="rocket"> ⚡ </span>
                  </li>
                  <li>
                    Corregir las veces que el sistema lo permita.
                    <span role="img" aria-label="rocket"> 🐙 </span>
                  </li>
                  <li>
                    Saber tus calificaciones a tiempo.
                    <span role="img" aria-label="rocket"> 📅 </span>
                  </li>
                  <li>
                    Ingresar a tu cuenta personal desde tu computadora o desde tu
                    celular.
                    <span role="img" aria-label="rocket"> 📱 </span>
                  </li>
                </ol>
              </div>
              <div style="margin-top: 3rem; width: 95%">
                <p>
                  Al iniciar sesión, llegarás a una sección llamada
                  <span style="background-color: #57FFB3; padding: 5px 12px"
                    >Dashboard</span
                  >.
                </p>
                <p>
                  En esta sección encontrarás tu información, el acceso a talleres y
                  las notas de los mismos. No sin antes llenar una encuesta,
                  totalmente confidencial, que no guarda información del autor de la
                  misma.
                </p>
              </div>
              <div style="margin-top: 15%">
                <p>Gracias por crear tu cuenta.</p>
              </div>
              <div style="margin-top: 12%; color: #7d64ff">
                <p>Cualquier consulta escribe al correo:</p>
                <p>academoxyz@academo.xyz</p>
              </div>
            </div>
          </div>
        </body>
      </html>`,
  });
};

exports.testMail = testMail;
exports.registerMail = registerMail;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys"); // Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login"); // Load User model
const User = require("../../models/User");
const Courses = require("../../models/Courses");
// Import nodemailer
var nodemailer = require("nodemailer");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  console.log("\nbackend register");
  console.log(req.body);

  const { errors, isValid } = validateRegisterInput(req.body); // Check validation

  if (!isValid) {
    console.log(`isValid: ${isValid}`);
    console.log(`errors:`);
    console.log(errors);

    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists. Please login." });
    } else {
      const newUser = new User({
        name: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        },
        email: req.body.email,
        password: req.body.password,
        identification: req.body.identification,
        subject: req.body.subject,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              res.json(user);
              Courses.findOneAndUpdate(
                { _id: user.subject },
                { $push: { enroll: user.id } }
              )
                .then((subjc) => console.log(`Subjc added: ${subjc}`))
                .catch((err) => console.log(`Subjc err: ${err}`));
              // -----
              // Define transporter to login to mail sender account
              var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.mailUser,
                  pass: process.env.mailPas,
                },
              });
              // NodeMail Send:
              transporter.sendMail(
                {
                  from: process.env.mailUser, // sender address
                  to: newUser.email, // list of receivers
                  subject: `Gracias ${req.body.firstName}. Tu cuenta se ha creado.`, // Subject line
                  html: `<h3
                  style="
                    text-shadow: 3px 2px 1px black;
                    color: white;
                    background-color: rgb(116, 35, 153);
                    font-weight: bold;
                    padding: 7px 8px;
                    width: 90%;
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
                    width: 90%;
                    font-weight: 700;
                    padding: 1px 5px;
                  "
                >
                  <p>
                    Hola,
                    <strong style="background-color: rgb(40, 210, 105);">
                      ${req.body.firstName}</strong
                    >, Tu password es:<strong style="background-color: rgb(40, 210, 105);"
                      >${req.body.password}</strong
                    >
                  </p>
                  <div style="margin-top: 52%;">
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
                (error, info) => {
                  console.log(error);
                  console.log(info);
                }
              );
            })
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body); // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password; // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found. Please Register first!" });
    } // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched

        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 7200, // 2h in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;

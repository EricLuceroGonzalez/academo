// For Login and Register
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");
const Image = require("../models/Image-Model");

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

const postExam = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    const error = new HttpError("Invalid inputs, please check your data", 422);
    return next(error);
  }
  // Check if the user creator already exists:
  const {
    theId,
    totalPts,
    testId,
    testName,
    grade,
    allPts,
    badAns,
    badQuest,
    goodAns,
    goodQuest,
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
    badAns: badAns,
    badQuest: badQuest,
    allPts: allPts,
    goodAns: goodAns,
    goodQuest: goodQuest,
  };

  const sendMail = async (user) => {
    await transporter.sendMail({
      from: process.env.mailUser, // sender address
      to: user.email, // list of receivers/
      subject: `Academo. ${user.name.firstName}, hemos recibido tu calificación 👍`, // Subject line
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
                padding: 27px 28px;
                width: 97%;
                box-shadow: 3px 3px aqua;
                font-family: 'Montserrat', sans-serif;
              "
            >
              Academo
            </h3>
            <div
            style="
              background-color: rgb(226, 225, 226);
              border: 2px solid #7d64ff;
              width: 95%;
              font-size: 1.35em;
              font-weight: 700;
              padding: 6rem 2rem;
              color: #7d64ff;
              font-family: 'Montserrat', sans-serif;
            "
          >
          <div>Hola, <b>${user.name.firstName}</b>, hemos recibido el 
          <strong style="padding: 3px 6px; background-color: #57FFB3;">${testName}</strong>
          </div>
          <div style="margin-top: 80px;">Has obtenido una calificación de:
      <div style="font-size: 2rem; text-align: center;">
        <strong style="padding: 3px 6px; background-color: #57FFB3;">${grade}</strong>
        <span role="img" aria-label="${
          grade < 60 ? "think-face" : "rocket"
        }"> ${grade < 60 ? "🤔" : "🚀"} </span>
      </div>
          </div>
          </div>
          <div style="text-align: center; margin: 140px auto 80px auto;">
            <img
            width="120px"
            alt="academo logo is an A in a circle with an arrow"
            src="https://res.cloudinary.com/dcvnw6hvt/image/upload/v1599179407/Academo/Identidy/academoLogoC_oxeawu.png">
          </div>
        </div>
        </body>
      </html>`,
    });
  };

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    if (user.testInfo.length === 0) {
      user.testInfo.push(testInfo);
    } else {
      // Function that returns -1 if theres is no value on an array
      const findIt = async () => {
        for (let i = 0; i < user.testInfo.length; i++) {
          if (user.testInfo[i]["test"].toString() === testId) {
            return i;
          }
        }
        return -1;
      };
      let index = await findIt();
      try {
        if (index === -1) {
          user.testInfo.push(testInfo);
        } else {
          user.testInfo[index] = testInfo;
        }
      } catch (err) {
        // console.log(err);
      }
    }
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

const getUserTest = async (req, res, next) => {
  // console.log("\n---------------------");

  const userId = req.params.id;
  // console.log(`id: ${userId}`);
  let tests = [];
  try {
    user = await User.findById(userId);
    user.testInfo.map((item) => {
      // console.log(item);
      tests.push({ grd: item.grade, testId: item.test });
    });
    res.status(200).json({ response: tests });
  } catch (err) {
    // console.info("next()");
    next();
  }
};

// To post a test to a course:
const postNewTest = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Los valores introducidos no son validos. Intenta de nuevo",
      422
    );
    return next(error);
  }

  console.log(req.body);

  let existingTest;
  try {
    existingTest = await Test.findOne({ testName: req.body.testName });
  } catch (err) {
    const error = new HttpError(
      "Hemos tenido un error buscando las encuestas. Intenta de nuevo",
      422
    );
    return next(error);
  }

  if (existingTest) {
    console.log("\n\n existingTest");
    // console.log(existingTest);

    const error = new HttpError(
      "Ya existe una prueba con este nombre. Por favor, inicia sesión.",
      422
    );
    return next(error);
  }

  const newTest = await new Test({
    testName: req.body.testName,
    subject: req.body.subject,
    image: req.body.questionImage,
    instructions: req.body.instructions,
    contents: req.body.contents,
    description: req.body.description,
    evaluation: req.body.evaluation,
    questions: req.body.questions,
  });
  console.log("newTest:");
  // console.log(newTest);
  try {
    await newTest.save();
  } catch (err) {
    const error = new HttpError(
      "Hemos tenido un error creando el test. Intenta de nuevo",
      422
    );
    return next(error);
  }

  try {
    await Course.findOneAndUpdate(
      { _id: newTest.subject },
      { $push: { tests: newTest._id } }
    );
    res.status(200).json({
      success: true,
      message: `Test ${newTest._id} Submitted!`,
    });
  } catch (err) {
    const error = new HttpError(
      "Hemos tenido un error creando el test en el curso. Intenta de nuevo",
      422
    );
    return next(error);
  }
};

const getATest = async (req, res, next) => {
  console.log("getATest");
  console.log(req.params.id);

  try {
    let test;
    test = await Test.findById(req.params.id);
    res.status(200).json({ test });
  } catch (err) {
    // console.info("next()");
    next();
  }
};

const getAllImages = async (req, res, next) => {
  // console.log("\n *************** show Images ***************");
  try {
    const allImages = await Image.find();
    // console.log(allImages);
    res.status(200).json(allImages);
  } catch (err) {
    next();
  }
};

const postImage = async (req, res, next) => {
  // console.log("\n *************** post Image ***************");

  cloudinary.v2.uploader.upload(req.file.path, async (err, res) => {
    if (err) {
      req.json(err.message);
    }
    req.body.image = res.secure_url;
    req.body.imageId = res.public_id;

    await Image.create(req.body);
  });
};

const updateTest = async (req, res, next) => {
  testId = req.params.id;
  testUpdt = await Test.findById(testId);
  if (testUpdt) {
    // newTest = new Test(req.body);
    // console.log("Found test");
    try {
      updatedTest = await Test.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      // console.log("updated!");
      res.status(200).json({ updateTest: updateTest });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: `Error on saving! \n ${err}`,
      });
      next();
    }
  }
};

module.exports = {
  postExam,
  postNewTest,
  postImage,
  getATest,
  getUserTest,
  getAllImages,
  updateTest,
};

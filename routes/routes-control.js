// For Login and Register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const cloudinary = require("cloudinary");
const HttpError = require("../models/http-error");
const User = require("../models/User");
const Test = require("../models/Test");
const Course = require("../models/Courses");
const Image = require("../models/Image-Model");
const multer = require("multer");

// Image handle
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are accepted!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// pagueloFacilTest:
getPagueloFacil = async (req, res, next) => {
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
      to: "ericlucero501@gmail.com", // list of receivers
      subject: `Hola Eric..`, // Subject line
      html: `<h3
      style="
        text-shadow: 3px 2px 1px black;
        color: white;
        background-color: rgb(116, 135, 53);
        font-weight: bold;
        padding: 7px 8px;
        width: 90%;
        box-shadow: 6px 6px aqua;
      "
    >
      Taki
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
    <div>${req.body.currency} // ${req.body.amount} </div>
     <div>order_key: ${req.body.order_key} </div>
      <div>item_name: ${req.body.item_name} </div>
        <div>${req.body.return} </div>
    </div>`,
    },
    (error, info) => {
      console.log(error);
      console.log(info);
    }
  );

  try {
    let returnURl = encodeURIComponent(req.body.return);
    // res.redirect(`https://google.com`)
    const redirURL = await res.redirect(
      `https://sandbox.paguelofacil.com/LinkDeamon.cfm?CCLW=9658182B95FC7E8FE5C5386BCD5E9BCCE2FABED4A71ED5536C4061BEB45AA2F67158527FE42CF10746B6758380D79B95B66FCF809474D8BC7D4D4C6B6B940689&CMTN=${req.body.amount}&RETURN_URL=${returnURl}&CDSC=Boleto%20para%20el%20show%3A%20${req.body.item_name}%7C%7C%20Ticket%20No%3A%20${req.body.order_key}`
    );
    // NodeMail Send:
    transporter.sendMail(
      {
        from: process.env.mailUser, // sender address
        to: "ericlucero501@gmail.com", // list of receivers
        subject: `Hola Eric..`, // Subject line
        html: `<h3
      style="
        color: white;
        background-color: rgb(116, 135, 53);
        font-weight: bold;
        padding: 7px 8px;
        width: 90%;
        box-shadow: 6px 6px aqua;
      "
    >
      <div>${redirURL}</div>
    </h3>
`,
      },
      (error, info) => {
        console.log(error);
        console.log(info);
      }
    );
    await res.redirect(req.body.return);
  } catch (err) {
    // res.status(500).json({ message: "Some error ocurred. Please try again.", error: err });
  }
};
//ppv.webvideocore.net/ppv_index.php?l=ppv&a=pay_ticket&m=overlay&t=4&id=byb0xfhrycgk&pr=7911&uniqueOrderIdentifier=15962324503942100296680&outPage=https%253A%252F%252Ftakitv.com%252F&api=1575082
// mongoose.set('useFindAndModify', false);

https: postExam = async (req, res, next) => {
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
    allPts,
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
    allPts: allPts,
    goodAns: goodAns,
    goodQuest: goodQuest,
  };

  const sendMail = async (user) => {
    await transporter.sendMail({
      from: process.env.mailUser, // sender address
      to: user.email, // list of receivers/
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

postCourse = (req, res) => {
  // // console.log(req.body);

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

getCourses = (req, res) => {
  Course.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

getCourseDashboard = async (req, res, next) => {
  user = req.params.usr;
  // console.log(`user: ${user}`);

  let usrTests = [];
  try {
    courses = await Course.find({ enroll: user }).populate("tests");
    user = await User.findById(user);
    user.testInfo.map((item) => {
      // // console.log(`usrTest: ${item.test}`);
      usrTests.push({ grd: item.grade, testId: item.test });
    });
    res.status(200).json({ allTests: courses[0], usrTests: usrTests });
  } catch (err) {
    // console.info("next()");
    res.status(400).send(err);
    next();
  }
};

getUserTest = async (req, res, next) => {
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
postNewTest = (req, res) => {
  newTest = new Test(req.body);
  newTest
    .save()
    .then((theTest) => {
      // // console.log(`The test: \n ${theTest._id} \n ${theTest.subject}`);

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

getUserGrades = async (req, res, next) => {
  userId = req.params.id;
  // // console.log(`userId: ${userId}`);
  let user;
  let testAnswers = [];
  user = await User.findById(userId);
  if (user) {
    ids = user.testInfo.map((item, i) => {
      // // console.log(`test id: ${item.test}`);
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

getGrades = (req, res) => {
  User.find()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => res.status(400).send(err));
};

getATest = async (req, res, next) => {
  try {
    let test;
    test = await Test.findById(req.params.id);
    res.status(200).json({ test });
  } catch (err) {
    // // console.info("next()");
    next();
  }
};

getAllImages = async (req, res, next) => {
  // console.log("\n *************** show Images ***************");
  try {
    const allImages = await Image.find();
    // console.log(allImages);
    res.status(200).json(allImages);
  } catch (err) {
    next();
  }
};

postImage = async (req, res, next) => {
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

updateTest = async (req, res, next) => {
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

module.exports = {
  getGrades,
  getCourses,
  postExam,
  postCourse,
  postNewTest,
  postImage,
  getCourseDashboard,
  getATest,
  getACourse,
  getUserTest,
  getUserGrades,
  getAllImages,
  updateTest,
  getPagueloFacil,
};

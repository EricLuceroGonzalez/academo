const express = require("express");

const { check } = require("express-validator");

app = express();
const router = express.Router();
const userController = require("../controllers/user-controller");

router.get("/info/:uid", userController.getUserInfo);
router.get("/user/:uid", userController.getUserById);

router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(), // Test@test.com --> test@test.com
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);
router.post(
  "/login",
  [
    check("email").normalizeEmail({ gmail_remove_dots: false }).isEmail(), // Test@test.com --> test@test.com
    check("password").isLength({ min: 6 }),
  ],
  userController.login
);

router.post(
  "/postSurvey",
  [check("filledBy").not().isEmpty()],
  userController.postSurvey
);

router.patch("/:uid", userController.updateUserData);
router.get("/surveys", userController.getSurveys);
module.exports = router;

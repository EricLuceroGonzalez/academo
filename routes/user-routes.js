const express = require("express");

const { check } = require("express-validator");

app = express();
const router = express.Router();
const userController = require("../controllers/user-controller");

router.get("/info/:uid", userController.getUserInfo);

router.post(
  "/signup",
  [
    check("firstName").not().isEmpty(),
    check("lastName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(), // Test@test.com --> test@test.com
    check("password").isLength({ min: 6 }),
  ],
  userController.signup
);
router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(), // Test@test.com --> test@test.com
    check("password").isLength({ min: 6 }),
  ],
  userController.login
);

module.exports = router;

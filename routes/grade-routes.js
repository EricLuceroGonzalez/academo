const express = require("express");

const gradesCtrl = require("../controllers/grades-controller");
const router = express.Router();

// router.get("/getAllGrades", ctrl.getGrades);
router.get("/getUserGrades/:id", gradesCtrl.getUserGrades);
router.get("/getACourse/:id", gradesCtrl.getACourse);

module.exports = router;

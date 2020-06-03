const express = require("express");

const ctrl = require("./routes-control");
const router = express.Router();

router.get("/getAllGrades", ctrl.getGrades);
router.get("/getUserGrades/:id", ctrl.getUserGrades);
router.get("/courseDashboard/:usr", ctrl.getCourseDashboard);
router.get("/getAllCourses", ctrl.getCourses);
router.get("/getATest/:id", ctrl.getATest);
router.get("/userTest/:id", ctrl.getUserTest);
router.post("/test", ctrl.postExam);
router.post("/newTest", ctrl.postNewTest);
router.post("/newCourse", ctrl.postCourse);

module.exports = router;

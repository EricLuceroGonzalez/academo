const express = require("express");

const ctrl = require("./routes-control");
const router = express.Router();

router.get("/getAllGrades", ctrl.getGrades);
router.get("/courseDashboard/:usr", ctrl.getCourseDashboard);
router.get("/getATest/:name", ctrl.getATest);
router.get("/getAllCourses", ctrl.getCourses);
router.post("/test", ctrl.postExam);
router.post("/newTest", ctrl.postTest);
router.post("/newCourse", ctrl.postCourse);

module.exports = router;

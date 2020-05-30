const express = require("express");

const ctrl = require("./routes-control");
const router = express.Router();

router.get("/getAllGrades", ctrl.getGrades);
router.get("/courseDashboard/:usr", ctrl.getCourseDashboard);
router.get("/getAllCourses", ctrl.getCourses);
router.post("/test", ctrl.postExam);
router.post("/newTest", ctrl.postNewTest);
router.post("/newCourse", ctrl.postCourse);
router.get("/getATest/:id", ctrl.getATest);


module.exports = router;

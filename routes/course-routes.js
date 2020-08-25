const express = require("express");

const courseCtrl = require("../controllers/course-controllers");
const router = express.Router();

router.post("/newcourse", courseCtrl.postCourse);
router.post("/courses", courseCtrl.getCourses);
router.get("/coursesDashboard/:usr", courseCtrl.getCourseDashboard);

module.exports = router;

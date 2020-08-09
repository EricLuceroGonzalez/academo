const express = require("express");

const courseCtrl = require("../controllers/course-controllers");
const router = express.Router();

router.post("/newcourse", courseCtrl.postCourse);
router.post("/courses", courseCtrl.getCourses);
router.post("/coursesDashboard", courseCtrl.getCourseDashboard);

module.exports = router;

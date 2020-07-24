const express = require("express");
//IMAGE UPLOAD CONFIGURATION
const multer = require("multer");
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
const ctrl = require("./routes-control");
const gradesCtrl = require("./grades-controller");
const router = express.Router();

// router.get("/getAllGrades", ctrl.getGrades);
router.get("/getUserGrades/:id", ctrl.getUserGrades);
router.get("/courseDashboard/:usr", ctrl.getCourseDashboard);
router.get("/getAllCourses", ctrl.getCourses);
router.get("/getATest/:id", ctrl.getATest);
router.get("/userTest/:id", ctrl.getUserTest);
router.get("/getImages", ctrl.getAllImages);
router.post("/test", ctrl.postExam);
router.post("/newTest", ctrl.postNewTest);
router.post("/newCourse", ctrl.postCourse);
router.put("/update/:id", ctrl.updateTest);
router.post("/sendImage", upload.single("image"), ctrl.postImage);
router.get("/getAllGrades", gradesCtrl.getAllUsers);
router.get("/getACourse/:id", ctrl.getACourse);
module.exports = router;

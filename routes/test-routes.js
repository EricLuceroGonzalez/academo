const express = require("express");

const testCtrl = require("../controllers/test-controller");
const router = express.Router();

router.get("/getATest/:id", testCtrl.getATest);
router.get("/userTest/:id", testCtrl.getUserTest);
router.get("/getImages", testCtrl.getAllImages);
router.post("/test", testCtrl.postExam);
router.post("/newTest", testCtrl.postNewTest);
router.put("/update/:id", testCtrl.updateTest);
// router.post("/sendImage", upload.single("image"), testCtrl.postImage);

module.exports = router;

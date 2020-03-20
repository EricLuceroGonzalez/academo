const express = require("express");

const ctrl = require("./routes-control");
const router = express.Router();

// router.get("/comments", ctrl.getAllComments);
// router.get("/coupons", ctrl.getAllCoupons);
router.post("/test", ctrl.postExam);
router.get('/getAllGrades', ctrl.getGrades)

module.exports = router;

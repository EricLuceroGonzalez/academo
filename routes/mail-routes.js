const express = require("express");

const mailsCtrl = require("../controllers/mail-controller");
const router = express.Router();

router.get("/visitsMail", mailsCtrl.visitsMail);
router.get("/lowTest", mailsCtrl.lowTestsMail);

module.exports = router;
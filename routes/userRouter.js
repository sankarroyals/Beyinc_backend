const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.route("/getUser").post(userController.getProfile);
router.route("/verifyUserPassword").post(userController.verifyUserPassword);
router.route("/editprofile").post(userController.editProfile);
router.route("/updateVerification").post(userController.updateVerification);




module.exports = router;
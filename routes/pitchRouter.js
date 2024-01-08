const express = require("express");
const pitchController = require("../controllers/pitchController");
const router = express.Router();

router.route("/pendingPitch").post(pitchController.fetchPendingPitch);
router.route("/livePitch").post(pitchController.fetchLivePitch);
router.route("/changePitchStatus").post(pitchController.changePitchStatus);
router.route("/recentpitch").post(pitchController.recentPitchOfUser);




module.exports = router;
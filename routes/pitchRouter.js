const express = require("express");
const pitchController = require("../controllers/pitchController");
const router = express.Router();

router.route("/pendingPitch").post(pitchController.fetchPendingPitch);
router.route("/livePitch").post(pitchController.fetchLivePitch);
router.route("/allPitches").get(pitchController.fetchAllPitch);
router.route("/userPitches").post(pitchController.fetchUserPitches);
router.route("/updatePitch").post(pitchController.updateSinglePitch);



router.route("/changePitchStatus").post(pitchController.changePitchStatus);
router.route("/recentpitch").post(pitchController.recentPitchOfUser);
router.route("/singlePitch").post(pitchController.fetchSinglePitch);
router.route("/addComments").post(pitchController.addCommentsToAPitch);






module.exports = router;
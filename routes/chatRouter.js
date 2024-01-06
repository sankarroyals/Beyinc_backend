const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");


router.route("/addConversation").post(chatController.addConversation);
router.route("/getConversation").post(chatController.findUserConversation);
router.route("/deleteConversation").post(chatController.deleteUserConversation);

router.route("/addMessage").post(chatController.addMessage);
router.route("/deleteMessage").post(chatController.deleteMessage);
router.route("/getMessages").post(chatController.getMessage);






module.exports = router;
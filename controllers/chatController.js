const { authSchema } = require("../helpers/validations");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    signEmailOTpToken,
    verifyEmailOtpToken,
} = require("../helpers/jwt_helpers");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const twilio = require("twilio");
const UserUpdate = require("../models/UpdateApproval");
const cloudinary = require("../helpers/UploadImage");
const Conversation = require("../models/ChatConversationModel");
const Message = require("../models/MessageModel");


exports.addConversation = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.find({
            members: { $all: [req.body.senderId, req.body.receiverId] }
        })
        if (conversationExists.length == 0) {
            await Conversation.create({
                members: [req.body.senderId, req.body.receiverId]
            })
            return res.status(200).send('New Conversation is added')
        }
        return res.status(200).send('Already conversation is there')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.findUserConversation = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.find({
            members: { $in: [req.body.email] }
        })
        if (conversationExists) {
            return res.status(200).json(conversationExists)
        }
        return res.status(400).send('No Conversation found')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.deleteUserConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        await Conversation.deleteOne({ _id: conversationId })
        await Message.deleteMany({ conversationId: conversationId })
        return res.status(200).json('Conversation deleted successfully')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.addMessage = async (req, res, next) => {
    try {
            await Message.create(req.body)
            return res.status(200).send('New Message is added')
    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.deleteMessage = async (req, res, next) => {
    try {
        const {messageId} =  req.body
        await Message.deleteOne({ _id: messageId })
        return res.status(200).send('Message Deleted Successfully')
    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.getMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.body
        const result = await Message.find({conversationId: conversationId})
        return res.status(200).send(result)
    }
    catch (error) {
        return res.status(400).send(error)
    }
}




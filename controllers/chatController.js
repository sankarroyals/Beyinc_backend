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
const Pitch = require("../models/PitchModel");


exports.addConversation = async (req, res, next) => {
    try {
        const { form, email, teamMembers } = req.body;
        const { title, tags, changeStatus, pitchId, pitch, banner, logo, financials } = form;
        const conversationExists = await Conversation.find({
            members: { $all: [req.body.senderId, req.body.receiverId] }
        })
        if (conversationExists.length == 0) {
            // check pitch is there or not

            let pitchDetails = ''
            if (changeStatus == 'change') {
                // const pitchTitleExists = await Pitch.findOne({ title: title })
                // if (pitchTitleExists) {
                //     return res.status(400).send('Pitch Title already exists')
                // }
                let pitchDoc = ''
                if (pitch?.public_id == undefined) {
                    pitchDoc = await cloudinary.uploader.upload(pitch, {
                        folder: `${email}/pitch`
                    })
                } else {
                    pitchDoc = pitch
                }


                // uploading Banner image
                let bannerDoc = ''
                if (banner?.public_id == undefined) {
                    bannerDoc = await cloudinary.uploader.upload(banner, {
                        folder: `${email}/pitch`
                    })
                } else {
                    bannerDoc = banner
                }


                // uploading logo image
                let logoDoc = ''
                if (logo?.public_id == undefined) {
                    logoDoc = await cloudinary.uploader.upload(logo, {
                        folder: `${email}/pitch`
                    })
                } else {
                    logoDoc = logo
                }

                // uploading financials image
                let financialsDoc = ''
                if (financials?.public_id == undefined) {
                    financialsDoc = await cloudinary.uploader.upload(financials, {
                        folder: `${email}/pitch`
                    })
                } else {
                    financialsDoc = financials
                }

                const teams = []
                for (let i = 0; i < teamMembers.length; i++) {
                    let singMemberDoc = ''
                    if (teamMembers[i]?.memberPic.public_id == undefined) {
                        singMemberDoc = await cloudinary.uploader.upload(teamMembers[i]?.memberPic, {
                            folder: `${email}/pitch`
                        })
                    } else {
                        singMemberDoc = teamMembers[i]?.memberPic
                    }

                    teams.push({ memberPic: { secure_url: singMemberDoc?.secure_url, public_id: singMemberDoc?.public_id }, name: teamMembers[i]?.name, position: teamMembers[i]?.position, socialLink: teamMembers[i]?.socialLink, bio: teamMembers[i]?.bio })

                }

                // creating new pitch
                if (form._id !== undefined) {
                    delete form._id
                }
                pitchDetails = await Pitch.create({ ...form, teamMembers: [...teams], email: email, tags: tags.split(','), title: title, status: 'pending', pitch: { secure_url: pitchDoc?.secure_url, public_id: pitchDoc?.public_id }, banner: { secure_url: bannerDoc?.secure_url, public_id: bannerDoc?.public_id }, logo: { secure_url: logoDoc?.secure_url, public_id: logoDoc?.public_id }, financials: { secure_url: financialsDoc?.secure_url, public_id: financialsDoc?.public_id } })
            }

            // adding conversation after pitch done
            await Conversation.create({
                members: [req.body.senderId, req.body.receiverId], requestedTo: req.body.receiverId, status: 'pending', pitchId: pitchDetails == '' ? pitchId : pitchDetails._id
            })
            return res.status(200).send(`Message request sent to ${req.body.receiverId}`)
        } else {
            const text = conversationExists[0].status == 'pending' ? `Already request sent. It is in ${conversationExists[0].status} status` : `Already conversation approved by ${conversationExists[0].requestedTo}`
            return res.status(200).send(text)
        }

    }
    catch (error) {
        console.log(error);
        return res.status(400).send(error)
    }
}


exports.updateMessageRequest = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.findOne({
            _id: req.body.conversationId
        })
        if (conversationExists) {
            if (req.body.status == 'rejected') {
                await Conversation.deleteOne({ _id: req.body.conversationId })
                return res.status(200).send(`Message ${req.body.status}`)
            }
            await Conversation.updateOne({ _id: req.body.conversationId }, { $set: { status: req.body.status } })
            return res.status(200).send(`Message ${req.body.status}`)
        }
        return res.status(400).send('Conversation not found')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}

exports.fetchRequest = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.find({
            requestedTo: req.body.email, status: 'pending'
        })
        return res.status(200).send(conversationExists)

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
        const { file, email, conversationId, senderId, receiverId, message } = req.body
        if (file !== '') {
            const result = await cloudinary.uploader.upload(file, {
                folder: `${email}/chat`
            })
            await Message.create({ email, file: { public_id: result.public_id, secure_url: result.secure_url }, conversationId, senderId, receiverId, message })
            return res.status(200).send('New Message is added')
        }
        await Message.create({ email, file: '', conversationId, senderId, receiverId, message })
        return res.status(200).send('New Message is added')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.body
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
        const result = await Message.find({ conversationId: conversationId })
        return res.status(200).send(result)
    }
    catch (error) {
        return res.status(400).send(error)
    }
}






exports.getFrienddetailsByConversationId = async (req, res, next) => {
    try {
        const { conversationId } = req.body
        const result = await Conversation.findOne({ _id: conversationId })
        const friend = await User.findOne({email: result.requestedTo})
        return res.status(200).send({email: friend.email, image: friend.image, userName: friend.userName})
    }
    catch (error) {
        return res.status(400).send(error)
    }
}




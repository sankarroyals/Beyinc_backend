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
const send_Notification_mail = require("../helpers/EmailSending");
const Notification = require("../models/NotificationModel");


exports.addConversation = async (req, res, next) => {
    try {
        const { form, email, teamMembers, role, tags, pitchRequiredStatus } = req.body;
        const { title, changeStatus, pitchId, pitch, banner, logo, financials } = form;
        const conversationExists = await Conversation.find({
            'members.email': { $all: [req.body.senderId, req.body.receiverId] }
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
                const userExist = await User.findOne({ email: email })
                const colleges = []
                for (let i = 0; i < userExist.educationDetails.length; i++) {
                    colleges.push(userExist.educationDetails[i].college)
                }
                pitchDetails = await Pitch.create({ ...form, userInfo: userExist._id, comments: [], review: [],  teamMembers: [...teams],  pitchRequiredStatus: pitchRequiredStatus, email: email,  tags: tags, title: title, status: 'pending', pitch: { secure_url: pitchDoc?.secure_url, public_id: pitchDoc?.public_id }, banner: { secure_url: bannerDoc?.secure_url, public_id: bannerDoc?.public_id }, logo: { secure_url: logoDoc?.secure_url, public_id: logoDoc?.public_id }, financials: { secure_url: financialsDoc?.secure_url, public_id: financialsDoc?.public_id } })
            }

            const senderInfo = await User.findOne({ email: req.body.senderId });
            const receiverInfo = await User.findOne({ email: req.body.receiverId });
            // adding conversation after pitch done
            await Conversation.create({
                members: [{
                    email: senderInfo.email, profile_pic: senderInfo.image?.url, userName: senderInfo.userName, role: senderInfo.role, user: senderInfo._id,
                }, {
                    email: receiverInfo.email, profile_pic: receiverInfo.image?.url, userName: receiverInfo.userName, role: receiverInfo.role, user: receiverInfo._id,
                    }], lastMessageTo: '', seen: '', requestedTo: req.body.receiverId, status: 'pending', pitchId: pitchDetails == '' ? pitchId : pitchDetails._id
            })
            await send_Notification_mail(senderInfo.email, receiverInfo.email, `Message Request from ${senderInfo.userName}`, `${senderInfo.userName} sent a message request please check the notification section.`, receiverInfo.userName)
            return res.status(200).send(`Message request sent to ${receiverInfo.userName}`)
        } else {
            const text = conversationExists[0].status == 'pending' ? `Already request sent. It is in ${conversationExists[0].status} status` : `Already conversation approved by ${receiverInfo.userName}`
            return res.status(200).send(text)
        }

    }
    catch (error) {
        console.log(error);
        return res.status(400).send(error)
    }
}

// Admin can create direct conversation
exports.directConversationCreation = async (req, res, next) => {
    try {

        const conversationExists = await Conversation.find({
            'members.email': { $all: [req.body.senderId, req.body.receiverId] }
        })
        if (conversationExists.length == 0) {
            // adding conversation after pitch done
            const senderInfo = await User.findOne({ email: req.body.senderId });
            const receiverInfo = await User.findOne({ email: req.body.receiverId });
            await Conversation.create({
                members: [{
                    email: senderInfo.email, profile_pic: senderInfo.image?.url, userName: senderInfo.userName, role: senderInfo.role, user: senderInfo._id
                }, {
                    email: receiverInfo.email, profile_pic: receiverInfo.image?.url, userName: receiverInfo.userName, role: receiverInfo.role, user: receiverInfo._id
                    }], seen: '', lastMessageTo: '', requestedTo: req.body.receiverId, status: req.body.status,
            })
            await Notification.create({ senderInfo: senderInfo._id, receiver: receiverInfo.email, message: `${senderInfo.userName} has created a direct conversation with you.`, type: 'pitch', read: false })
            return res.status(200).send(`Conversation with ${receiverInfo.userName} created`)
        } else {
            const text = conversationExists[0].status == 'pending' ? `Already request sent. It is in ${conversationExists[0].status} status` : `Already conversation exists with this user`
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
            const UserExist = await User.findOne({ email: conversationExists.members[1].email })
            if (req.body.status == 'rejected') {
                await Conversation.deleteOne({ _id: req.body.conversationId })
                await send_Notification_mail(conversationExists.members[1].email, conversationExists.members[0].email, `Message Update from ${UserExist.userName}`, `${UserExist.userName} has ${req.body.status} your message request and added reason: "${req.body.rejectReason}"`, conversationExists.members[0].email)
                await send_Notification_mail(conversationExists.members[1].email, conversationExists.members[1].email, `Message Update`, `You have ${req.body.status} the message request sent by ${conversationExists.members[0].email}"`)
                await Notification.create({ senderInfo: UserExist._id,  receiver: conversationExists.members[0].email, message: `${UserExist.userName} has ${req.body.status} your message request and added reason: "${req.body.rejectReason}"`, type: 'pitch', read: false })
                return res.status(200).send(`Message ${req.body.status}`)
            }
            await Conversation.updateOne({ _id: req.body.conversationId }, { $set: { status: req.body.status } })
            await send_Notification_mail(conversationExists.members[1].email, conversationExists.members[0].email, `Message Update from ${UserExist.userName}`, `${UserExist.userName} has ${req.body.status} your message request and added reason: "${req.body.rejectReason}"`,conversationExists.members[0].email)
            await send_Notification_mail(conversationExists.members[1].email, conversationExists.members[1].email, `Message Update`, `You have ${req.body.status} the message request sent by ${conversationExists.members[0].email}"`)
            await Notification.create({ senderInfo: UserExist._id,  receiver: conversationExists.members[0].email, message: `${UserExist.userName} has ${req.body.status} your message request and added reason: "${req.body.rejectReason}"`, type: 'pitch', read: false })
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
        }).populate({ path: 'members.user', select: ['email','userName', 'image', 'role'] })
        return res.status(200).send(conversationExists)

    }
    catch (error) {
        return res.status(400).send(error)
    }
}

exports.findUserConversation = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.find({
            'members.email': { $in: [req.body.email] }
        })
            .populate({ path: 'members.user', select: ['email','userName', 'image', 'role']})
        // .populate('members.user')
        if (conversationExists) {
            return res.status(200).json(conversationExists)
        }
        return res.status(400).send('No Conversation found')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}

exports.findConversationById = async (req, res, next) => {
    try {
        const conversationExists = await Conversation.findOne({
            _id: req.body.conversationId
        })
            .populate({ path: 'members.user', select: ['email', 'userName', 'image', 'role'] })
        // .populate('members.user')
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
            await Conversation.updateOne({ _id: conversationId }, { $set: { seen: '', lastMessageTo: receiverId, lastMessageText: message} })
            return res.status(200).send('New Message is added')
        }
        await Message.create({ email, file: '', conversationId, senderId, receiverId, message })
        await Conversation.updateOne({ _id: conversationId }, { $set: { seen: '', lastMessageTo: receiverId, lastMessageText: message } })

        return res.status(200).send('New Message is added')

    }
    catch (error) {
        return res.status(400).send(error)
    }
}


exports.changeSeenStatus = async (req, res, next) => {
    try {
        const { senderId, receiverId } = req.body;
        const MessageExists = await Message.find({ senderId: senderId, receiverId: receiverId  }).sort({ _id: -1 }).limit(1)
        // console.log(MessageExists);
        // console.log(MessageExists[0].seen);
        if (MessageExists[0] && MessageExists[0].seen==undefined) {
            await Message.updateOne({ _id: MessageExists[0]._id }, { $set: { seen: new Date() } })
            await Conversation.updateOne({ _id: MessageExists[0].conversationId }, { $set:{seen: 'seen'} })

            return res.status(200).send('Message is seen')
        }
        await Conversation.updateOne({ _id: MessageExists[0].conversationId }, { $set:{seen: 'seen'} })

        return res.status(200).send('Message Already seen')


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


exports.getTotalMessageCount = async (req, res, next) => {
    try {
        const { receiverId, checkingUser } = req.body
        const result = await Conversation.find({ 'members.user': { $in: [receiverId] }, status: 'approved', seen: '', lastMessageTo: checkingUser })
        return res.status(200).send(result)
    }
    catch (error) {
        console.log(error);
        return res.status(400).send(error)
    }
}







exports.getFrienddetailsByConversationId = async (req, res, next) => {
    try {
        const { conversationId, email } = req.body
        const result = await Conversation.findOne({ _id: conversationId }).populate({ path: 'members.user', select: ['email','userName', 'image', 'role'] })
        const friendMail = await result.members.filter(f => f.email !== email)[0]
        return res.status(200).send(friendMail)
    }
    catch (error) {
        return res.status(400).send(error)
    }
}




exports.chatBlock = async (req, res, next) => {
    try {
        const { conversationId, blockedBy } = req.body
        const user = await User.findOne({ email: blockedBy })
        const conversation = await Conversation.findOne({ _id: conversationId, 'chatBlocked.blockedBy': blockedBy})
        if (conversation) {
            await Conversation.updateOne({ _id: conversationId }, { $set: { 'chatBlocked': {} } })
            return res.status(200).send('Chat Unblocked')
        } 
        await Conversation.updateOne({ _id: conversationId }, { $set: { 'chatBlocked': { userInfo: user._id, blockedBy: blockedBy } } })
        return res.status(200).send('Chat blocked')

    } catch (err) {
        return res.status(400).send(err)
    }
}


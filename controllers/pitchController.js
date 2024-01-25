const send_Notification_mail = require("../helpers/EmailSending")
const Notification = require("../models/NotificationModel")
const Pitch = require("../models/PitchModel")
const User = require("../models/UserModel")

exports.fetchPendingPitch = async (req, res, next) => {
    try {
        const pendingPitches = await Pitch.find({ status: 'pending' })
        return res.status(200).json(pendingPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.fetchSinglePitch = async (req, res, next) => {
    try {
        const pendingPitches = await Pitch.findOne({_id: req.body.pitchId})
        return res.status(200).json(pendingPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.updateSinglePitch = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            await Pitch.updateOne({ _id: req.body.pitchId }, { $set: { status: 'pending', pitchRequiredStatus: req.body.status } })
            await send_Notification_mail(pitch.email, pitch.email, `Pitch required status update !`, `For ${pitch.title}(${pitch._id}) required status has been updated to ${req.body.status}`)
            return res.status(200).json('Pitch updated')
        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}



exports.fetchUserPitches = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await Pitch.find({ email: email })
        return res.status(200).json(result)
    } catch (err) {
        return res.status(400).json(err)
    }
}




exports.fetchLivePitch = async (req, res, next) => {
    try {
        const livePitches = await Pitch.find({ status: 'approved', pitchRequiredStatus: 'show' })
        return res.status(200).json(livePitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.addPitchComment = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const user = await User.findOne({ email: req.body.comment.email })
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'comments': { ...req.body.comment, userName: user.userName, profile_pic: user.image?.url, createdAt: new Date()} }  })
            return res.status(200).json('Comment added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.removePitchComment = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const commentExist = await Pitch.findOne({ 'comments._id': req.body.commentId })
            await Pitch.updateOne({ _id: req.body.pitchId }, { $pull: { 'comments': { _id: req.body.commentId } } })
            return res.status(200).json('Comment Deleted')
        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.addIntrest = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExist = await Pitch.findOne({ _id: req.body.pitchId, 'intrest.email': { $in: [req.body.email] } })
            if (userExist) {
                return res.status(400).json('user already in the intrest list')
            }
            const user = await User.findOne({email: req.body.email})
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'intrest': {email:req.body.email, profile_pic: user.image?.url, userName: user.userName} } })
            await send_Notification_mail(pitch.email, pitch.email, `Added new Intrest !`, `${user.userName} has added pitch ${pitch.title}(${pitch._id}) into their interest list. Check notification for more info.`)
            await Notification.create({ sender: user.userName, senderEmail: user.email, senderProfile: user.image?.url, receiver: pitch.email, message: `${user.userName} has added ${pitch.title}(${pitch._id}) into their interest list.`, type: 'pitch', read: false })
            return res.status(200).json('Intrest added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.removeFromIntrest = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExist = await Pitch.findOne({ _id: req.body.pitchId, 'intrest.email': { $in: [req.body.email] } })
            if (userExist) {
                const user = await User.findOne({ email: req.body.email })
                await Pitch.updateOne({ _id: req.body.pitchId }, { $pull: { 'intrest': { email: req.body.email } } })
                await send_Notification_mail(pitch.email, pitch.email, `Removed from Intrest !`, `${user.userName} has removed pitch ${pitch.title}(${pitch._id}) from their interest list. Check notification for more info.`)
                await Notification.create({ sender: user.userName, senderEmail: user.email, senderProfile: user.image?.url, receiver: pitch.email, message: `${user.userName} has removed ${pitch.title}(${pitch._id}) from their interest list.`, type: 'pitch', read: false })
                return res.status(200).json('User removed from intrest list')
            }
            return res.status(400).json('user not in the intrest list')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}



exports.addReviewStars = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId })
        if (pitch) {
            const userExists = await Pitch.findOne({ '_id': req.body.pitchId, 'review.email': req.body.review.email })
            if (userExists) {
                await Pitch.updateOne({ '_id': req.body.pitchId, 'review.email': req.body.review.email }, { 'review.$.review': req.body.review.review})
                return res.status(200).json('Review updated')
            }
            const user = await User.findOne({ email: req.body.review.email })
            await Pitch.updateOne({ _id: req.body.pitchId }, { $push: { 'review': req.body.review } })
            await send_Notification_mail(pitch.email, pitch.email, `Added Stars to the pitch!`, `${req.body.review.email} has added ${req.body.review.review} stars to the ${pitch.title}(${pitch._id}) pitch. Check notification for more info.`)
            await Notification.create({ sender: pitch.userName, senderEmail: user.email, senderProfile: user.image?.url, receiver: pitch.email, message: `${req.body.review.email} has added ${req.body.review.review} stars to the ${pitch.title}(${pitch._id}) pitch.`, type: 'pitch', read: false })
            return res.status(200).json('Review added')

        }
        return res.status(400).json('No Pitch Found')
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.getReviewStars = async (req, res, next) => {
    try {
        const pitch = await Pitch.findOne({ _id: req.body.pitchId, 'review.email': req.body.email }, { 'review.$': 1 })
        if (pitch) {
            return res.status(200).json(pitch.review.length > 0 && pitch.review[0])

        }
        return res.status(200).json({})
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.fetchAllPitch = async (req, res, next) => {
    try {
        const AllPitches = await Pitch.find()
        return res.status(200).json(AllPitches)
    } catch (err) {
        return res.status(400).json(err)
    }
}

exports.changePitchStatus = async (req, res, next) => {
    try {
        const { pitchId, status, reason } = req.body; 
        const pitch = await Pitch.findOne({_id: pitchId})
        const changedPitch = await Pitch.updateOne({ _id: pitchId }, { $set: { status: status } })
        if (status == 'rejected') {
            await send_Notification_mail(pitch.email, pitch.email, `Pitch status update !`, `For pitch ${pitch.title}(${pitch._id}) status has been updated to ${req.body.status} by the admin and added comment: "${reason}"`)
            await Notification.create({ receiver: pitch.email, message: `For pitch ${pitch.title}(${pitch._id}) status has been updated to ${req.body.status} by the admin : "${reason}"`, type: 'pitch', read: false })
            return res.status(200).json(changedPitch)

        }
        await send_Notification_mail(pitch.email, pitch.email, `Pitch status update !`, `For pitch ${pitch.title}(${pitch._id}) status has been updated to ${req.body.status} by the admin`)
        await Notification.create({ receiver: pitch.email, message: `For pitch ${pitch.title}(${pitch._id}) status has been updated to ${req.body.status} by the admin`, type: 'pitch', read: false })

        return res.status(200).json(changedPitch)
    } catch (err) {
        return res.status(400).json(err)
    }
}


exports.recentPitchOfUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const recentPitch = await Pitch.find({ email: email }).sort({ _id: -1 }).limit(1)
        return res.status(200).json(recentPitch)
    } catch (err) {
        return res.status(400).json(err)
    }
}
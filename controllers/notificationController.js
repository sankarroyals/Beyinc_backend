const Notification = require("../models/NotificationModel")

exports.fetchNotifications = async (req, res, next) => {
    try {
        const { email } = req.body
        const noti =await Notification.find({ receiver: email })
        return res.status(200).json(noti)
        
    } catch (err) {
        return res.status(400).json('Error Occured')

    }
}

exports.changeToRead= async (req, res, next) => {
    try {
        const { notificationId } = req.body
        await Notification.updateOne({ _id: notificationId }, {$set: {read: true}})
        return res.status(200).json('changed to read')

    } catch (err) {
        return res.status(400).json('Error Occured')

    }
}
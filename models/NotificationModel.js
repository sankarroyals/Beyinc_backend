const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    sender: {
        type: String
    },
    senderEmail: {
        type: String
    },
    senderProfile: { type: String },
    receiver: {
        type: String
    },
    message: {
        type: String
    },
    type: {
        type: String
    }, read: {
        type: Boolean
    }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Notification = new mongoose.model('Notification', NotificationSchema)
module.exports = Notification;
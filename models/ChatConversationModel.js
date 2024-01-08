const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    members: {
        type: Array,
    },
    status: {
        type: String
    },
    requestedTo: {
        type: String
    }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Conversation = new mongoose.model('Conversation', conversationSchema)
module.exports = Conversation;
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    members: {
       type: Array,
   }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Conversation = new mongoose.model('Conversation', conversationSchema)
module.exports = Conversation;
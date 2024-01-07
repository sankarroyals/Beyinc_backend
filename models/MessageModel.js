const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: String
    },
    senderId: {
        type: String
    },
    receiverId: {
        type: String
    },
    message: {
        type: String
    },
    file: {
        
        public_id: {
                type: String
        },
        secure_url: {
            type: String
        }
        
    }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Message = new mongoose.model('Message', MessageSchema)
module.exports = Message;
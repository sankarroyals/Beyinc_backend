const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        email: {
            type: String
        }, 
        // userName: {
        //     type: String
        // },
        // profile_pic: {
        //     type: String
        // },
        // role: {
        //     type: String
        // }
    }],
    status: {
        type: String
    },
    requestedTo: {
        type: String
    }, 
    pitchId: {
        type: String
    }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Conversation = new mongoose.model('Conversation', conversationSchema)
module.exports = Conversation;
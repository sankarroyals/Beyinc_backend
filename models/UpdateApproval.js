const mongoose = require('mongoose');

const userApprovalSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String
    },
    role: {
        type: String
    },
    verification: {
        type: String
    }
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const UserUpdate = new mongoose.model('UserUpdateApproval', userApprovalSchema)
module.exports = UserUpdate;
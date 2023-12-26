const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    role: {
        type: String
    },
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const User = new mongoose.model('User', userSchema)
module.exports =  User;
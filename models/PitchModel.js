const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema({
    email: {
        type: String
    },
    tags: {
       type: Array
    }, 
    title: {
        type: String
    },
    status: {
        type: String
    },
    pitch: {
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

const Pitch = new mongoose.model('Pitch', pitchSchema)
module.exports = Pitch;
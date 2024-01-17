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
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    },
    role: {
        type: String
    },
    verification: {
        type: String
    },
    freeCoins: {
        type: String
    },
    realCoins: {
        type: String
    }, experienceDetails: [{
        year: { type: String },
        company: { type: String },
        profession: { type: String },
    }],
    educationDetails: [{
        year: { type: String },
        grade: { type: String },
        college: { type: String },
    }],
    fee: {
        type: String
    }, bio: {
        type: String
    },
    documents: {
       
        resume: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
       
        
        acheivements: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        
        degree: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        
        expertise: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
            
        },
       
        working: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        }
    }
    
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const User = new mongoose.model('User', userSchema)
module.exports =  User;
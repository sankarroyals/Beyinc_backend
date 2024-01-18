const mongoose = require('mongoose');

const pitchSchema = new mongoose.Schema({
    email: {
        type: String
    }, profile_pic: {
        type: String
    }, userName: {
        type: String
    },
    state: { type: String },
    town: { type: String },
    country: { type: String },
    role: {
        type: String
    },
    website: {
        type: String
    },
    teamOverview: {
        type: String
    },
    business: {
        type: String
    },
    memberscountry: {
        type: String
    },
    industry1: {
        type: String
    },
    idealInvestor: {
        type: String
    },
    industry1: {
        type: String
    },
    market: {
        type: String
    },
    minimumInvestment: {
        type: String
    },
    objectives: {
        type: String
    },
    previousRoundRaise: {
        type: String
    },
    progress: {
        type: String
    },
    raised: {
        type: String
    },
    raising: {
        type: String
    },
    shortSummary: {
        type: String
    },
    stage: {
        type: String
    },
    tags: {
        type: Array
    },
    title: {
        type: String
    },
    heading: {
        type: String
    },
    description: {
        type: String
    },
    hiringPositions: {
        type: Array
    },
    pitchRequiredStatus: {
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
    },
    logo: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    banner: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    }, financials: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    teamMembers: [{
        memberPic: {
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        },
        name: {
            type: String
        },
        position: {
            type: String
        },
        socialLink: {
            type: String
        },
        bio: {
            type: String
        }
    }],
    comments: [{
        email: {
            type: String
        }, 
        profile_pic: {
            type: String
        },
        userName: {
            type: String
        },
        comment: {
            type: String
        },
        createdAt: {
            type: Date
        }

    }],
    intrest: [{
        email: {
            type: String
        },
        userName: {
            type: String
        }, profile_pic: {
            type: String
        },
        createdAt: {
            type: Date
        }

    }],
    review: [{
        email: {
            type: String
        },
        review: {
            type: Number
        },
        createdAt: {
            type: Date
        }

    }]
}, {
    timestamps: true  // This adds 'createdAt' and 'updatedAt' fields
})

const Pitch = new mongoose.model('Pitch', pitchSchema)
module.exports = Pitch;
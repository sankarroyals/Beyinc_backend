const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    role: {
      type: String,
    },
    verification: {
      type: String,
    },
    freeCoins: {
      type: String,
    },
    state: { type: String },
    town: { type: String },
    country: { type: String },
    payment: [
      {
        email: {
          type: String,
        },
        profile_pic: {
          type: String,
        },
        userName: {
          type: String,
        },
        role: {
          type: String,
        },
        moneyPaid: {
          type: Number,
        },
        noOfTimes: {
          type: Number,
        },
        createdAt: {
          type: Date,
        },
      },
    ],

    realCoins: {
      type: String,
    },
    experienceDetails: [
      {
        domain: { type: String },
        start: { type: String },
        end: { type: String },
        year: { type: String },
        company: { type: String },
        profession: { type: String },
      },
    ],
    educationDetails: [
      {
        Edstart: { type: String },
        Edend: { type: String },
        year: { type: String },
        grade: { type: String },
        college: { type: String },
      },
    ],
    fee: {
      type: String,
    },
    bio: {
      type: String,
    },
    documents: {
      resume: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },

      acheivements: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },

      degree: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },

      expertise: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },

      working: {
        public_id: {
          type: String,
        },
        secure_url: {
          type: String,
        },
      },
    },
    review: [
      {
        reviewBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
        },
        review: {
          type: Number,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    skills: { type: Array },
    languagesKnown: { type: Array },
    chatBlock: [
      {
        userInfo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    chatBlockedBy: [
      {
        userInfo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
    comments: [
      {
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        email: {
          type: String,
        },
        // profile_pic: {
        //     type: String
        // },
        // userName: {
        //     type: String
        // },
        comment: {
          type: String,
        },
        createdAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true, // This adds 'createdAt' and 'updatedAt' fields
  }
);

const User = new mongoose.model("User", userSchema);
module.exports = User;

const { authSchema } = require("../helpers/validations");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailOTpToken,
  verifyEmailOtpToken,
} = require("../helpers/jwt_helpers");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const twilio = require("twilio");


exports.getProfile = async (req, res, next) => {
    try{
const {email} = req.body
const userDoesExist = await User.findOne({ email: email });
if(userDoesExist){
  
    return res.status(200).json(userDoesExist)
}
    }
    catch(error){
        console.log(error)
    }
}






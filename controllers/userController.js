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
const UserUpdate = require("../models/UpdateApproval");


exports.getProfile = async (req, res, next) => {
    try {
        const { email } = req.body
        const userDoesExist = await User.findOne({ email: email });
        if (userDoesExist) {
            return res.status(200).json(userDoesExist)
        }
    }
    catch (error) {
        console.log(error)
    }
}

exports.editProfile = async (req, res, next) => {
    try {
        const { email, userName, role, phone } = req.body;
        // validating email and password
        const validating_email_password = await authSchema.validateAsync(req.body);

        // Checking user already exist or not
        const userDoesExist = await UserUpdate.findOne({ email: email });
        if (userDoesExist) {
            await UserUpdate.updateOne({ email: email }, { $set: { userName, role, phone, verification: 'pending' } })
            return res.send({message: 'Profile Sent for approval!' });
        } 
        await UserUpdate.create({email: email, role: role, userName: userName, phone: phone, verification: 'pending'})
        return res.send({ message: 'Profile Sent for approval!' });

    } catch (err) {
        if (err.isJoi == true) err.status = 422;
        next(err);
    }
}

exports.updateVerification = async (req, res, next) => {
    try {
        const { email, status } = req.body;
        // Checking user already exist or not
        const userDoesExist = await UserUpdate.findOne({ email: email });
        if (!userDoesExist) {
            return res.status(404).json({ message: "User not found" });
        }
        await UserUpdate.updateOne({ email: email }, { $set: { verification: status }})
        return res.send({ message: `Profile status is ${status} !` });

    } catch (err) {
        if (err.isJoi == true) err.status = 422;
        next(err);
    }
}

exports.verifyUserPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // validating email and password
        const validating_email_password = await authSchema.validateAsync(req.body);

        // Checking user already exist or not
        const userDoesExist = await User.findOne({ email: email });
        if (!userDoesExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // comparing password
        if (
            !(await bcrypt.compare(
                validating_email_password.password,
                userDoesExist.password
            ))
        ) {
            return res.status(404).json({ message: "Entered password is wrong" });
        } else {

            return res.send({ message: 'Password verified' });
        }
    } catch (err) {
        if (err.isJoi == true) err.status = 422;
        next(err);
    }
}







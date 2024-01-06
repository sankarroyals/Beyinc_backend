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
const cloudinary = require("../helpers/UploadImage");


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
            return res.send({ message: 'Profile Sent for approval!' });
        }
        await UserUpdate.create({ email: email, role: role, userName: userName, phone: phone, verification: 'pending' })
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
        await UserUpdate.updateOne({ email: email }, { $set: { verification: status } })
        if (status == 'approved') {
            await User.updateOne({ email: email }, { $set: { email: userDoesExist.email, role: userDoesExist.role, userName: userDoesExist.userName, phone: userDoesExist.phone, verification: status } })
        }
        return res.send({ message: `Profile status is ${status} !` });

    } catch (err) {
        return res.status(400).send({ message: `Error in Profile updation !` });

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

            return res.send({ message: 'Password verification' });
        }
    } catch (err) {
        if (err.isJoi == true) err.status = 422;
        next(err);
    }
}



exports.updateProfileImage = async (req, res, next) => {
    try {
        const { email, image } = req.body;
        const userDoesExist = await User.findOne({ email: email });
        if (!userDoesExist) {
            return res.status(400).send('User not found')
        }
        if (userDoesExist.image.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.image.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        const result = await cloudinary.uploader.upload(image, {
            folder: 'users'
        })
        await User.updateOne({ email: email }, {
            $set: {
                image: {
                    public_id: result.public_id,
                    url: result.secure_url
                }
            }
        })
        const accessToken = await signAccessToken(
            { email: userDoesExist.email, user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, image: result.secure_url, verification: userDoesExist.verification },
            `${userDoesExist._id}`
        );
        const refreshToken = await signRefreshToken(
            { email: userDoesExist.email, _id: userDoesExist._id },
            `${userDoesExist._id}`
        );

        return res.send({ accessToken: accessToken, refreshToken: refreshToken });

    } catch (err) {
        console.log(err);
        return res.status(400).json('Error while updating profile')
    }
}

exports.deleteProfileImage = async (req, res, next) => {
    try {
        const { email } = req.body;
        const userDoesExist = await User.findOne({ email: email });
        if (!userDoesExist) {
            return res.status(400).send('User not found')
        }
        if (userDoesExist.image.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.image.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        await User.updateOne({ email: email }, {
            $set: {
                image: undefined
            }
        })
        const accessToken = await signAccessToken(
            { email: userDoesExist.email, user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, verification: userDoesExist.verification },
            `${userDoesExist._id}`
        );
        const refreshToken = await signRefreshToken(
            { email: userDoesExist.email, _id: userDoesExist._id },
            `${userDoesExist._id}`
        );

        return res.send({ accessToken: accessToken, refreshToken: refreshToken });

    } catch (err) {
        console.log(err);
        return res.status(400).json('Error while updating profile')
    }
}







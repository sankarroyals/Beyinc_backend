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
        const { email, userName, role, phone, documents } = req.body;
        // validating email and password

        const userDoesExist = await UserUpdate.findOne({ email: email });
        // Checking user already exist or not
        if (userDoesExist.documents.resume?.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.documents.resume.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        if (userDoesExist.documents.expertise?.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.documents.expertise.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        if (userDoesExist.documents.acheivements?.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.documents.acheivements.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        if (userDoesExist.documents.degree?.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.documents.degree.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }
        if (userDoesExist.documents.working?.public_id !== undefined) {
            await cloudinary.uploader.destroy(userDoesExist.documents.working.public_id, (error, result) => {
                if (error) {
                    console.error('Error deleting image:', error);
                } else {
                    console.log('Image deleted successfully:', result);
                }
            });
        }

        const resume = await cloudinary.uploader.upload(documents.resume, {
            folder: 'documents'
        })
        const expertise = await cloudinary.uploader.upload(documents.expertise, {
            folder: 'documents'
        })
        const acheivements = await cloudinary.uploader.upload(documents.acheivements, {
            folder: 'documents'
        })
        const degree = await cloudinary.uploader.upload(documents.degree, {
            folder: 'documents'
        })
        const working = await cloudinary.uploader.upload(documents.working, {
            folder: 'documents'
        })


        if (userDoesExist) {
            await UserUpdate.updateOne({ email: email }, { $set: { userName, role, phone, verification: 'pending', documents: {
                resume: {
                    public_id: resume.public_id,
                    url: resume.secure_url
                },
                expertise: {
                    public_id: expertise.public_id,
                    url: expertise.secure_url
                },
                acheivements: {
                    public_id: acheivements.public_id,
                    url: acheivements.secure_url
                },
                degree: {
                    public_id: degree.public_id,
                    url: degree.secure_url
                },
                working: {
                    public_id: working.public_id,
                    url: working.secure_url
                },
            }} })
            return res.send({ message: 'Profile Sent for approval!' });
        }
        await UserUpdate.create({
            email: email, role: role, userName: userName, phone: phone, verification: 'pending', documents: {
                resume: {
                    public_id: resume.public_id,
                    url: resume.secure_url
                },
                expertise: {
                    public_id: expertise.public_id,
                    url: expertise.secure_url
                },
                acheivements: {
                    public_id: acheivements.public_id,
                    url: acheivements.secure_url
                },
                degree: {
                    public_id: degree.public_id,
                    url: degree.secure_url
                },
                working: {
                    public_id: working.public_id,
                    url: working.secure_url
                },
            } })
        return res.send({ message: 'Profile Sent for approval!' });

    } catch (err) {
        return res.send({ message: err });
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
            await User.updateOne({ email: email }, { $set: { email: userDoesExist.email, documents: userDoesExist.documents, role: userDoesExist.role, userName: userDoesExist.userName, phone: userDoesExist.phone, verification: status } })
        } else {
            await User.updateOne({ email: email }, { $set: { verification: status } })
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
            { email: userDoesExist.email, coins: userDoesExist.coins, documents: userDoesExist.documents, user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, image: result.secure_url, verification: userDoesExist.verification },
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
            { email: userDoesExist.email, coins: userDoesExist.coins, documents: userDoesExist.documents, user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, verification: userDoesExist.verification },
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



exports.getUsers = async (req, res, next) => {
    try {
        const { type } = req.body
        if (type !== '') {
            let result = await User.find({ role: type })
            return res.status(200).json(result)
        } else {
            let result = await User.find()
            return res.status(200).json(result)
        }

    } catch (err) {
        return res.status(400).json('Error while fetching')
    }
}







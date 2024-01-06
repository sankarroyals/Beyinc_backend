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
        
        // if (userDoesExist?.documents.expertise?.public_id !== undefined) {
        //     await cloudinary.uploader.destroy(userDoesExist?.documents.expertise.public_id, (error, result) => {
        //         if (error) {
        //             console.error('Error deleting image:', error);
        //         } else {
        //             console.log('Image deleted successfully:', result);
        //         }
        //     });
        // }
        // if (userDoesExist?.documents.acheivements?.public_id !== undefined) {
        //     await cloudinary.uploader.destroy(userDoesExist?.documents.acheivements.public_id, (error, result) => {
        //         if (error) {
        //             console.error('Error deleting image:', error);
        //         } else {
        //             console.log('Image deleted successfully:', result);
        //         }
        //     });
        // }
        // if (userDoesExist?.documents.degree?.public_id !== undefined) {
        //     await cloudinary.uploader.destroy(userDoesExist?.documents.degree.public_id, (error, result) => {
        //         if (error) {
        //             console.error('Error deleting image:', error);
        //         } else {
        //             console.log('Image deleted successfully:', result);
        //         }
        //     });
        // }
        // if (userDoesExist?.documents.working?.public_id !== undefined) {
        //     await cloudinary.uploader.destroy(userDoesExist?.documents.working.public_id, (error, result) => {
        //         if (error) {
        //             console.error('Error deleting image:', error);
        //         } else {
        //             console.log('Image deleted successfully:', result);
        //         }
        //     });
        // }

        let resume = ''
        if (documents.resume !== '') {
            if (documents.resume?.public_id == undefined) {
                if (userDoesExist?.documents.resume.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.resume.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
                resume = await cloudinary.uploader.upload(documents.resume, {
                    folder: `${email}/documents`
                })
            } else {
                
                resume = documents.resume
            }
           
        } else {
            if (userDoesExist?.documents.resume.public_id !== undefined) {
                await cloudinary.uploader.destroy(userDoesExist?.documents.resume.public_id, (error, result) => {
                    if (error) {
                        console.error('Error deleting image:', error);
                    } else {
                        console.log('Image deleted successfully:', result);
                    }
                });
            }
        }
        let expertise = ''
        if (documents.expertise !== '') {
            if (documents.expertise?.public_id == undefined) {
                if (userDoesExist?.documents.expertise.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.expertise.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
                expertise = await cloudinary.uploader.upload(documents.expertise, {
                    folder: `${email}/documents`
                })
            } else {
               
                expertise = documents.expertise
            }
            
        } else {
            if (userDoesExist?.documents.expertise.public_id !== undefined) {
                await cloudinary.uploader.destroy(userDoesExist?.documents.expertise.public_id, (error, result) => {
                    if (error) {
                        console.error('Error deleting image:', error);
                    } else {
                        console.log('Image deleted successfully:', result);
                    }
                });
            }
        }
        let acheivements = ''
        if (documents.acheivements !== '') {
            if (documents.acheivements?.public_id == undefined) {
                if (userDoesExist?.documents.acheivements.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.acheivements.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
                acheivements = await cloudinary.uploader.upload(documents.acheivements, {
                    folder: `${email}/documents`
                })
            }
            else {
                
                acheivements = documents.acheivements
            }
           
        } else {
            if (userDoesExist?.documents.acheivements.public_id !== undefined) {
                await cloudinary.uploader.destroy(userDoesExist?.documents.acheivements.public_id, (error, result) => {
                    if (error) {
                        console.error('Error deleting image:', error);
                    } else {
                        console.log('Image deleted successfully:', result);
                    }
                });
            }
        }
        let degree = ''
        if (documents.degree !== '') {
            if (documents.degree?.public_id == undefined) {
                if (userDoesExist?.documents.degree.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.degree.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
                degree = await cloudinary.uploader.upload(documents.degree, {
                    folder: `${email}/documents`
                })
            }
            else {
                
                degree = documents.degree
            }
            
        } else {
            if (userDoesExist?.documents.degree.public_id !== undefined) {
                await cloudinary.uploader.destroy(userDoesExist?.documents.degree.public_id, (error, result) => {
                    if (error) {
                        console.error('Error deleting image:', error);
                    } else {
                        console.log('Image deleted successfully:', result);
                    }
                });
            }
        }
        let working = ''
        if (documents.working !== '') {
            if (documents.working?.public_id == undefined) {
                if (userDoesExist?.documents.working.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.working.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
                working = await cloudinary.uploader.upload(documents.working, {
                    folder: `${email}/documents`
                })
            } else {
              
                working = documents.working
            }
            
        } else {
            if (documents.working?.public_id == undefined) {
                if (userDoesExist?.documents.working.public_id !== undefined) {
                    await cloudinary.uploader.destroy(userDoesExist?.documents.working.public_id, (error, result) => {
                        if (error) {
                            console.error('Error deleting image:', error);
                        } else {
                            console.log('Image deleted successfully:', result);
                        }
                    });
                }
            }
        }


        if (userDoesExist) {
            await UserUpdate.updateOne({ email: email }, { $set: { userName, role, phone, verification: 'pending', documents: {
                resume: {
                    public_id: resume.public_id,
                    secure_url: resume.secure_url
                },
                expertise: {
                    public_id: expertise.public_id,
                    secure_url: expertise.secure_url
                },
                acheivements: {
                    public_id: acheivements.public_id,
                    secure_url: acheivements.secure_url
                },
                degree: {
                    public_id: degree.public_id,
                    secure_url: degree.secure_url
                },
                working: {
                    public_id: working.public_id,
                    secure_url: working.secure_url
                },
            }
            }
            })
            await User.updateOne({ email: email }, { $set: { verification: 'pending' } })
            const userExist = await User.findOne({email: email})
            const accessToken = await signAccessToken(
                { email: userExist.email, coins: userExist.coins, documents: userExist.documents, user_id: userExist._id, role: userExist.role, userName: userExist.userName, image: userExist.image?.url, verification: userExist.verification },
                `${userExist._id}`
            );
            const refreshToken = await signRefreshToken(
                { email: userExist.email, _id: userExist._id },
                `${userExist._id}`
            );

            return res.send({ accessToken: accessToken, refreshToken: refreshToken });
        }
        await UserUpdate.create({
            email: email, role: role, userName: userName, phone: phone, verification: 'pending', documents: {
                resume: {
                    public_id: resume.public_id,
                    secure_url: resume.secure_url
                },
                expertise: {
                    public_id: expertise.public_id,
                    secure_url: expertise.secure_url
                },
                acheivements: {
                    public_id: acheivements.public_id,
                    secure_url: acheivements.secure_url
                },
                degree: {
                    public_id: degree.public_id,
                    secure_url: degree.secure_url
                },
                working: {
                    public_id: working.public_id,
                    secure_url: working.secure_url
                },
            }
        })
        await User.updateOne({ email: email }, { $set: {verification: 'pending' } })

        const userExist = await User.findOne({ email: email })
        const accessToken = await signAccessToken(
            { email: userExist.email, coins: userExist.coins, documents: userExist.documents, user_id: userExist._id, role: userExist.role, userName: userExist.userName, image: userExist.image?.url, verification: userExist.verification },
            `${userExist._id}`
        );
        const refreshToken = await signRefreshToken(
            { email: userExist.email, _id: userExist._id },
            `${userExist._id}`
        );

        return res.send({ accessToken: accessToken, refreshToken: refreshToken });

    } catch (err) {
        return res.status(400).send({ message: err });
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
            folder: `${email}`
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







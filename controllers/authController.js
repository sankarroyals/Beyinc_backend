const { authSchema } = require("../helpers/validations");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailOTpToken,
  verifyEmailOtpToken,
  verifyAccessToken,
  verifyAPiAccessToken,
} = require("../helpers/jwt_helpers");
const User = require("../models/UserModel");
const dotenv = require("dotenv");
const Userverify = require("../models/OtpModel");
dotenv.config({ path: "../config.env" });
const twilio = require("twilio");

exports.register = async (req, res, next) => {
  try {
    const { email, password, phone, role, userName } = req.body;
    // validating email and password
    const validating_email_password = await authSchema.validateAsync(req.body);

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const passwordHashing = await bcrypt.hash(
      validating_email_password.password,
      salt
    );

    // Checking user already exist or not
    const userDoesExist = await User.findOne({ email: email });
    const userNameDoesExist = await User.findOne({ userName: userName });
    const phoneExist = await User.findOne({ phone: phone });
    const ErrorMessages = [];
    if (userDoesExist) {
      ErrorMessages.push("Email");
      // return res.status(404).json({message: 'Email Already Exist'})
    }
    if (userNameDoesExist) {
      ErrorMessages.push("User Name ");
      // return res.status(404).json({message: 'User Name Already Exist'})
    }
    if (phoneExist) {
      ErrorMessages.push("Phone Number ");
      // return res.status(404).json({message: 'Phone Number Already Exist'})
    }

    if (ErrorMessages.length > 0) {
      return res.status(404).json({ message: ErrorMessages.join(',')+'Already exists' });
    }
    await User.create({
      email,
      password: passwordHashing,
      phone,
      role,
      userName,
      verification: 'initial'
    });
    const userDetails = await User.findOne({ email: email });

    const accessToken = await signAccessToken(
      { email: email, user_id: userDetails._id },
      `${userDetails._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: email, user_id: userDetails._id },
      `${userDetails._id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};


exports.login = async (req, res, next) => {
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
      return res.status(404).json({ message: "Email/password is wrong" });
    } else {
      const accessToken = await signAccessToken(
        { email: userDoesExist.email, coins: userDoesExist.coins, documents: userDoesExist.documents , user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, image: userDoesExist.image?.url, verification: userDoesExist.verification },
        `${userDoesExist._id}`
      );
      const refreshToken = await signRefreshToken(
        { email: userDoesExist.email, _id: userDoesExist._id },
        `${userDoesExist._id}`
      );

      return res.send({ accessToken: accessToken, refreshToken: refreshToken });
    }
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

exports.mobile_login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    // const validating_email_password = await authSchema.validateAsync(req.body);

    // Checking user already exist or not
    const phoneExist = await User.findOne({ phone: phone });
    if (!phoneExist) {
      return res.status(404).json({ message: "User not found" });
    }

    // comparing password
    // if (
    //   !(await bcrypt.compare(
    //     validating_email_password.password,
    //     phoneExist.password
    //   ))
    // ) {
    //   return res
    //     .status(404)
    //     .json({ message: "Phone Number/password is wrong" });
    // } else {
      const accessToken = await signAccessToken(
        { email: phoneExist.email, user_id: phoneExist._id },
        `${phoneExist._id}`
      );
      const refreshToken = await signRefreshToken(
        { email: phoneExist.email, _id: phoneExist._id },
        `${phoneExist._id}`
      );

      return res.send({ accessToken: accessToken, refreshToken: refreshToken });
    // }
  } catch (err) {
    if (err.isJoi == true) err.status = 422;
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Bad request" });
    }
    const { user_id, email } = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(
      { email: email, user_id: user_id },
      `${user_id}`
    );
    const refreshtoken = await signRefreshToken(
      { email: email, user_id: user_id },
      `${user_id}`
    );

    return res.send({ accessToken: accessToken, refreshToken: refreshtoken });
  } catch (err) {
    return res.status(400).json(err);

  }
};

exports.verifyMainAccessToken = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "Bad request" });
    }
    const { email } = await verifyAPiAccessToken(accessToken);
    const userDoesExist = await User.findOne({email: email})
    const currentaccessToken = await signAccessToken(
      { email: userDoesExist.email, coins: userDoesExist.coins, documents: userDoesExist.documents, user_id: userDoesExist._id, role: userDoesExist.role, userName: userDoesExist.userName, image: userDoesExist.image?.url, verification: userDoesExist.verification },
      `${userDoesExist._id}`
    );
    const refreshToken = await signRefreshToken(
      { email: userDoesExist.email, _id: userDoesExist._id },
      `${userDoesExist._id}`
    );
    return res.send({ accessToken: currentaccessToken, refreshToken: refreshToken });
  } catch (err) {
    return res.status(400).json(err);

  }
};


exports.mobile_otp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const accountSid = process.env.TWILIO_ACCOUNTSID;
    const authToken = process.env.TWILIO_AUTHTOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE;

    // const client = twilio(accountSid, authToken);
    // client.messages
    //   .create({
    //     body: `Your one-time Beyinc verification code: ${otp}`,
    //     from: twilioPhoneNumber,
    //     to: phone,
    //   })
    //   .then(async (message) => {
    //     const userFind = await Userverify.findOne({ email: phone });
    //     const otpToken = await signEmailOTpToken({ otp: otp.toString() });
    //     if (userFind) {
    //       await Userverify.updateOne(
    //         { email: phone },
    //         { $set: { verifyToken: otpToken } }
    //       );
    //     } else {
    //       await Userverify.create({ email: phone, verifyToken: otpToken });
    //     }
    //     res.status(200).send("OTP sent successfully");
    //   })
    //   .catch((error) => {
    //     console.error("Error sending OTP via SMS:", error);
    //     res.status(500).send("Internal Server Error");
    //   });
  } catch (err) {
    next(err);
  }
};

exports.forgot_password = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validating email and password
    const validating_email_password = await authSchema.validateAsync(req.body);
    const salt = await bcrypt.genSalt(10);
    const passwordHashing = await bcrypt.hash(
      validating_email_password.password,
      salt
    );

    const userDoesExist = await User.findOne({ email: email });
    if (!userDoesExist) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.updateOne(
      { email: email },
      { $set: { password: passwordHashing } }
    );
    // await User.save()
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.send_otp_mail = async (req, res, next) => {
  try {
    const { to, subject } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // Replace with your Gmail email address
        pass: process.env.EMAIL_PASSWORD, // Replace with your Gmail password (or use an app password)
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL, // Replace with your Gmail email address
      to: to,
      subject: subject,
      html: `
        <div style="font-family: 'Arial', sans-serif; padding: 20px; text-align: center; background-color: #f4f4f4;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Your one-time Beyinc verification code: <span stle="color: blue">${otp.toString()}</span></p>
        <img src="https://beyinc.net/wp-content/uploads/2023/08/WhatsApp_Image_2023-08-02_at_11.23.51_PM__2_-removebg-preview.png" alt="Embedded Image" style="width: 100%; max-width: 400px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 14px; color: #777; margin-top: 20px;">Thanks and Regards,</p>
        <p style="font-size: 16px; color: #555; font-weight: bold;">Beyinc</p>
        </div>
       `,
    };

    // Send email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        res.status(500).send("Internal Server Error");
      } else {
        const userFind = await Userverify.findOne({ email: to });
        const otpToken = await signEmailOTpToken({ otp: otp.toString() });
        if (userFind) {
          await Userverify.updateOne(
            { email: to },
            { $set: { verifyToken: otpToken } }
          );
        } else {
          await Userverify.create({ email: to, verifyToken: otpToken });
        }
        res.status(200).send("Email sent successfully");
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.verify_otp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const EmailToken = await Userverify.findOne({ email: email });
    if (EmailToken) {
      const { otp } = await verifyEmailOtpToken(EmailToken.verifyToken);
      if (req.body.otp == otp) {
        return res.status(200).json({ message: "OTP is Success" });
      } else {
        return res.status(404).json({ message: "Entered OTP is wrong" });
      }
    } else {
      return res.status(404).json({ message: "Please request a Otp" });
    }
  } catch (err) {
    return res.status(404).json({ message: "Entered OTP is wrong" });
  }
};



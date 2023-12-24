
const {authSchema} = require('../helpers/validations')
const bcrypt = require('bcrypt')
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helpers/jwt_helpers')
const User = require('../models/UserModel')
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });


exports.register = async (req, res, next) => {
    try {
        const {email, password, phone, role, userName} = req.body;
        // validating email and password
        const validating_email_password = await authSchema.validateAsync(req.body);

        // hashing password
        const salt = await bcrypt.genSalt(10);
        const passwordHashing = await bcrypt.hash(validating_email_password.password, salt)

        // Checking user already exist or not
        const userDoesExist = await User.findOne({email: email});
        const userNameDoesExist = await User.findOne({userName: userName});
        const phoneExist = await User.findOne({phone: phone});
        const ErrorMessages = [];
        if(userDoesExist){
            ErrorMessages.push('Email Already Exist');
            // return res.status(404).json({message: 'Email Already Exist'})
        }
        if(userNameDoesExist){
            ErrorMessages.push('User Name Already Exist');
            // return res.status(404).json({message: 'User Name Already Exist'})
        } 
        if(phoneExist){
            ErrorMessages.push('Phone Number Already Exist');
            // return res.status(404).json({message: 'Phone Number Already Exist'})
        } 
        if(ErrorMessages.length>0){
           return res.status(404).json({message: ErrorMessages}) 
        }
        await User.create({email, password: passwordHashing, phone, role, userName})
        const userDetails = await User.findOne({email: email})

        const accessToken = await signAccessToken({email: email, user_id: userDetails._id}, `${userDetails._id}`)
        const refreshToken = await signRefreshToken({email: email, user_id: userDetails._id}, `${userDetails._id}`)

        return res.send({accessToken: accessToken, refreshToken: refreshToken})

    } catch (err) {
        if(err.isJoi==true) err.status=422
        next(err);
    }
  };

  exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        // validating email and password
        const validating_email_password = await authSchema.validateAsync(req.body);
        

        // Checking user already exist or not
        const userDoesExist = await User.findOne({email: email});
        if(!userDoesExist){
            return res.status(404).json({message: 'User not found'})
        } 

        // comparing password
        if(!await bcrypt.compare(validating_email_password.password, userDoesExist.password) ){
            return res.status(404).json({message: 'Email/password is wrong'})
        } else {
            const accessToken = await signAccessToken({email: userDoesExist.email, user_id: userDoesExist._id}, `${userDoesExist._id}`)
            const refreshToken = await signRefreshToken({email: userDoesExist.email, _id: userDoesExist._id}, `${userDoesExist._id}`)

            return res.send({accessToken: accessToken, refreshToken: refreshToken})
        }
    
    } catch (err) {
        if(err.isJoi==true) err.status=422
        next(err);
    }
  };

  exports.mobile_login = async (req, res, next) => {
    try {
        const {phone, password} = req.body;
        const validating_email_password = await authSchema.validateAsync(req.body);

        // Checking user already exist or not
        const phoneExist = await User.findOne({phone: phone});
        if(!phoneExist){
            return res.status(404).json({message: 'User not found'})
        } 

        // comparing password
        if(!await bcrypt.compare(validating_email_password.password, phoneExist.password) ){
            return res.status(404).json({message: 'Phone Number/password is wrong'})
        } else {
            const accessToken = await signAccessToken({email: phoneExist.email, user_id: phoneExist._id}, `${phoneExist._id}`)
            const refreshToken = await signRefreshToken({email: phoneExist.email, _id: phoneExist._id}, `${phoneExist._id}`)

            return res.send({accessToken: accessToken, refreshToken: refreshToken})
        }
    
    } catch (err) {
        if(err.isJoi==true) err.status=422
        next(err);
    }
  };


  exports.refreshToken = async (req, res, next) => {
    try {
      const {refreshToken} = req.body;
      if(!refreshToken){
        return res.status(400).json({message: 'Bad request'})
     }
     const {user_id, email} = await verifyRefreshToken(refreshToken);
     const accessToken = await signAccessToken({email: email, user_id: user_id}, `${user_id}`)
     const refreshtoken = await signRefreshToken({email: email, user_id: user_id}, `${user_id}`)

     return res.send({accessToken: accessToken, refreshToken: refreshtoken})

    } catch (err) {
        if(err.isJoi==true) err.status=422
        next(err);
    }
  };

exports.mobile_otp = async (req, res, next) => {
    try {
      
    
    } catch (err) {
        next(err);
    }
}

exports.forgot_password = async (req, res, next) =>{
    try{
        const {email, password} = req.body;

        // validating email and password
        const validating_email_password = await authSchema.validateAsync(req.body);
        const salt = await bcrypt.genSalt(10);
        const passwordHashing = await bcrypt.hash(validating_email_password.password, salt)

        const userDoesExist = await User.findOne({email: email});
        if(!userDoesExist){
            return res.status(404).json({message: 'User not found'})
        } 
        await User.updateOne({email: email},{$set: {password: passwordHashing}})
        // await User.save()
        return res.status(200).json({message: 'Password changed successfully'})

    } catch (err) {
        next(err);

    }
}

  
const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const opts = {
    overwrite: true,
    invalidation: true,
    resource_type: 'auto'
}

module.exports = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, opts, (error, result)=>{
            if(result && result.secure_url) {
                console.log(result.secure_url)
                return resolve(result.secure_url)
            }
            console.log(error.message)
            return reject({message: error.message})
        })
    })
}
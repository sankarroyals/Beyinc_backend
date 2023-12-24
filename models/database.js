const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

const connectdb = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (err) {
        console.error('Database connection failed');
        process.exit(0);
    }
}


module.exports = connectdb;
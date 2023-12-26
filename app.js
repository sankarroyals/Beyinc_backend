const express = require("express");
const authRouter = require('./routes/authRouter')
const {verifyAccessToken} = require('./helpers/jwt_helpers')

const cors = require("cors");
const morgan = require("morgan");


const app = express();
// MIDDLEWARES
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({extended:true, limit: '25mb'}))

// ROUTES
app.use("/api/auth",  authRouter);


module.exports = app;
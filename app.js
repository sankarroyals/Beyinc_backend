const express = require("express");
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const chatRouter = require('./routes/chatRouter')
const pitchRouter = require('./routes/pitchRouter')

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');

const {verifyAccessToken} = require('./helpers/jwt_helpers')

const cors = require("cors");
const morgan = require("morgan");


const app = express();
// MIDDLEWARES
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({extended:true, limit: '25mb'}))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// ROUTES
app.use("/api/auth",  authRouter);
app.use("/api/userDetails",
    verifyAccessToken,
    userRouter);

app.use("/api/chat",
    verifyAccessToken,
    chatRouter);

app.use("/api/pitch",
    verifyAccessToken,
    pitchRouter);


module.exports = app;
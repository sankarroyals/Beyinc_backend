const express = require("express");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const userCommentRouter = require("./routes/userCommentsRouter");
const helperRouter = require("./routes/helperRouter");
const dashboardRouter = require("./routes/dashboardRouter");

const chatRouter = require("./routes/chatRouter");
const pitchRouter = require("./routes/pitchRouter");
const pitchCommentRouter = require("./routes/PitchCommentRouter");

const NotificationRouter = require("./routes/NotificationRouter");

const rolerouter = require("./routes/rolesRouter");

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger");

const { verifyAccessToken } = require("./helpers/jwt_helpers");

const cors = require("cors");
const morgan = require("morgan");

const app = express();
// MIDDLEWARES
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// ROUTES
app.use("/api/auth", authRouter);

app.use("/api/helper", helperRouter);
app.use("/api/userDetails", verifyAccessToken, userCommentRouter);

app.use("/api/chat", verifyAccessToken, chatRouter);

app.use("/api/dashboard", verifyAccessToken, dashboardRouter);

app.use("/api/userDetails", verifyAccessToken, userRouter);

app.use("/api/pitch", verifyAccessToken, pitchCommentRouter);

app.use("/api/notification", verifyAccessToken, NotificationRouter);

app.use("/api/pitch", verifyAccessToken, pitchRouter);

app.use("/api/notification", verifyAccessToken, NotificationRouter);

app.use("/api/role", rolerouter);

module.exports = app;

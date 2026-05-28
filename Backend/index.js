const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { ExpressAuth } = require("@auth/express");
require("dotenv").config();

const connectDB = require("./config/database");
const { authConfig } = require("./config/auth");

const { apiLimiter } = require("./middleware/rateLimit");
const errorHandler = require("./middleware/errorHandler");

const authRoute = require("./routes/auth");
const oauthRoute = require("./routes/oauth");
const jobRoute = require("./routes/jobRoute");
const interviewRoutes = require("./routes/interviewRoutes");
const cvRoute = require("./routes/ai/cv.route");
const analyzeJobRoute = require("./routes/ai/jobs.route");
const tipRoute = require("./routes/ai/tips.route");
const aiMatchRoute = require("./routes/ai/match.route");
const aiParseRoute = require("./routes/ai/parse.route");
const aiImproveRoute = require("./routes/ai/improve.route");

const app = express();
const port = process.env.PORT || 5000;

// Behind a proxy (Render, Vercel, etc.) — required for secure cookies + req.ip
app.set("trust proxy", 1);

connectDB();

/* -------- Security middleware -------- */
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

/* -------- Auth.js (social login) --------
 * Mount BEFORE rate-limit / body parsers don't interfere here since
 * Auth.js reads its own body. Exposed routes:
 *   GET  /auth/signin/:provider
 *   GET  /auth/callback/:provider
 *   GET  /auth/session
 *   POST /auth/signout
 */
app.use("/auth", ExpressAuth(authConfig));

/* -------- Rate limiting (global API) -------- */
app.use("/api", apiLimiter);

/* -------- Routes -------- */
app.use("/api/auth", authRoute);
app.use("/api/auth", oauthRoute); // social-login bridge: /api/auth/social/*
app.use("/api/jobs", jobRoute);
app.use("/api/interviews", interviewRoutes);
app.use("/api/cv", cvRoute);
app.use("/api/analyze-job", analyzeJobRoute);
app.use("/api/tips", tipRoute);
app.use("/api/ai", aiMatchRoute);
app.use("/api/ai/parse", aiParseRoute);
app.use("/api/ai/improve", aiImproveRoute);

app.get("/", (req, res) => {
  res.json({ message: "Job Tracker API v2", status: "ok" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

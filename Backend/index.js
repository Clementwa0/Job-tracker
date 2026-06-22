const express = require("express");
const path = require("path");
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
const uploadRoute = require("./routes/uploadRoute");
const resumeRoutes = require("./routes/resumeRoutes");
const publicRoutes = require("./routes/publicRoutes");
const employerRoutes = require("./routes/employerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const cvRoute = require("./routes/ai/cv.route");
const analyzeJobRoute = require("./routes/ai/jobs.route");
const tipRoute = require("./routes/ai/tips.route");
const aiMatchRoute = require("./routes/ai/match.route");
const aiParseRoute = require("./routes/ai/parse.route");
const aiImproveRoute = require("./routes/ai/improve.route");
const auth = require("./middleware/auth");
const { aiUserLimiter } = require("./middleware/aiRateLimit");

const app = express();
const port = process.env.PORT;

// Behind a proxy (Render, Vercel, etc.) — required for secure cookies + req.ip
app.set("trust proxy", 1);

connectDB();

/* -------- Security middleware -------- */
app.use(
  helmet({
    // API is consumed cross-origin by the Vite dev server
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, mobile apps) with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || allowedOrigins[0]);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
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

/* -------- Static uploads -------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------- Routes -------- */
app.use("/api/auth", authRoute);
app.use("/api/auth", oauthRoute); // social-login bridge: /api/auth/social/*
app.use("/api/jobs", jobRoute);
app.use("/api/interviews", interviewRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/resumes", resumeRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cv", auth, aiUserLimiter, cvRoute);
app.use("/api/analyze-job", auth, aiUserLimiter, analyzeJobRoute);
app.use("/api/tips", auth, aiUserLimiter, tipRoute);
app.use("/api/ai", auth, aiUserLimiter, aiMatchRoute);
app.use("/api/ai/parse", auth, aiUserLimiter, aiParseRoute);
app.use("/api/ai/improve", auth, aiUserLimiter, aiImproveRoute);

app.get("/", (req, res) => {
  res.json({ message: "Job Tracker API v2", status: "ok" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

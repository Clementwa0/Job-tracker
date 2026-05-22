const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");

const jobRoute = require("./routes/jobRoute");
const authRoute = require("./routes/auth");

const cvRoute = require("./routes/ai/cv.route");
const analyzeJobRoute = require("./routes/ai/jobs.route");
const tipRoute = require("./routes/ai/tips.route");

const interviewRoutes = require("./routes/interviewRoutes");

const app = express();
const port = process.env.PORT;

/* ---------------- DATABASE ---------------- */
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ---------------- ROUTES ---------------- */

// Auth
app.use("/api/auth", authRoute);

// Jobs (CRUD)
app.use("/api/jobs", jobRoute);

// Interviews
app.use("/api/interviews", interviewRoutes);

// AI MODULES (clean namespace grouping)
app.use("/api/cv", cvRoute);
app.use("/api/analyze-job", analyzeJobRoute);
app.use("/api/tips", tipRoute);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.json({
    message: "Job Tracker API is running",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me",
      },
      jobs: "GET /api/jobs",
      interviews: "GET /api/interviews",
      ai: {
        cv: "POST /api/cv",
        analyzeJob: "POST /api/analyze-job",
        tip: "GET /api/tips",
      },
    },
  });
});

/* ---------------- ERROR HANDLING ---------------- */
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

/* ---------------- 404 HANDLER ---------------- */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();
const connectDB = require('./config/database');
const jobRoute = require('./routes/jobRoute');
const auth = require('./routes/auth')
const reviewRouter = require('./routes/aiRoute')
const analyzeJobRoute = require("./routes/analyze-job");
const tip = require("./routes/tip")
const app = express();
const port = process.env.PORT;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' })); 
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/auth', auth);
app.use('/api/jobs', jobRoute);
app.use("/api/cv", reviewRouter);
app.use("/api/analyze-job", analyzeJobRoute);
app.use("/api/tip", tip)

app.get('/', (req, res) => {
  res.json({
    message: 'Job Tracker API is running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getCurrentUser: 'GET /api/auth/me'
      }
    }
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API Documentation: http://localhost:${port}`);
});

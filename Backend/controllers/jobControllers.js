const { validationResult } = require("express-validator");
const Job = require("../models/Jobs");

// Post a Job
const addJob = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      jobTitle,
      companyName,
      location,
      jobType,
      applicationDate,
      applicationDeadline,
      source,
      applicationStatus,
      contactPerson,
      contactEmail,
      contactPhone,
      resumeFile,
      coverLetterFile,
      jobPostingUrl,
      salaryRange,
      notes,
    } = req.body;

    // Create new job
    const job = new Job({
      jobTitle,
      companyName,
      location,
      jobType,
      applicationDate,
      applicationDeadline,
      source,
      applicationStatus,
      contactPerson,
      contactEmail,
      contactPhone,
      resumeFile: typeof resumeFile === "string" ? resumeFile : "",
      coverLetterFile,
      jobPostingUrl,
      salaryRange,
      notes,
      userId: req.userId,
    });

    await job.save();

    // Generate token

    res.status(201).json({
      success: true,
      message: "Job Saved successfully",
      data: {
        job: job.toJSON(),
      },
    });
  } catch (error) {
    console.error("Saving error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all jobs
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId });
    res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// Get a single job by ID
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.userId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// Update a job by ID
// Update a job by ID
const updateJob = async (req, res) => {
  try {
    // 1. Destructure and pull interviews OUT of req.body so it doesn't pollute the update payload
    const { interviews, ...jobFieldsToUpdate } = req.body;

    // 2. Swapped findByIdAndUpdate out for findOneAndUpdate to securely query by both ID and Owner
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      jobFieldsToUpdate, // Pass only the sanitized job fields here
      { new: true, runValidators: true }, // runValidators ensures updates match schema limitations
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    console.error("Updating error:", error); // Good visibility for server terminal logs
    res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete a job by ID
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

module.exports = {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
};

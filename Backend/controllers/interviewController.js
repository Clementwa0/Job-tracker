const Interview = require("../models/interview");
const Job = require("../models/Jobs");

/* ================= CREATE INTERVIEW ================= */
const createInterview = async (req, res) => {
  try {
    const { jobId, stage, type, status, interviewDate, location, notes } = req.body;
    const interviewStage = stage || type;

    // ensure job belongs to user
    const job = await Job.findOne({
      _id: jobId,
      userId: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const interview = await Interview.create({
      userId: req.userId,
      jobId,
      stage: interviewStage,
      status,
      interviewDate,
      location,
      notes,
    });

    // attach interview to job
    job.interviews.push(interview._id);
    await job.save();

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create interview",
      error: error.message,
    });
  }
};

/* ================= GET ALL USER INTERVIEWS ================= */
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .populate("jobId", "jobTitle companyName applicationStatus")
      .sort({ interviewDate: 1 });

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
    });
  }
};

/* ================= UPDATE ================= */
const updateInterview = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.type && !updates.stage) {
      updates.stage = updates.type;
      delete updates.type;
    }

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

/* ================= DELETE ================= */
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (interview) {
      await Job.updateOne(
        { _id: interview.jobId },
        { $pull: { interviews: interview._id } }
      );
    }

    res.json({
      success: true,
      message: "Interview deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};

/* ================= GET INTERVIEWS BY JOB ================= */
const getJobInterviews = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      userId: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const interviews = await Interview.find({
      userId: req.userId,
      jobId: req.params.jobId,
    })
      .populate("jobId", "jobTitle companyName applicationStatus")
      .sort({ interviewDate: 1 });

    res.json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job interviews",
    });
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getJobInterviews,
  updateInterview,
  deleteInterview,
};
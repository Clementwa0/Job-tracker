const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  location: { type: String },
  jobType: { type: String },
  applicationDate: { type: Date },
  source: { type: String },
  applicationStatus: { type: String },
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  resumeFile: { type: String, default: "" },
  coverLetterFile: { type: String, default: "" },
  jobPostingUrl: { type: String },
  salaryRange: { type: String },
  notes: { type: String },
  nextStepsDate: { type: Date }
});

module.exports = mongoose.model('Job', JobSchema);

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobTitle: String,
  companyName: String,
  location: String,
  jobType: String,
  applicationDate: Date,
  applicationDeadline: Date,
  source: String,
  applicationStatus: String,
  contactPerson: String,
  contactEmail: String,
  contactPhone: String,
  resumeFile: String,
  coverLetterFile: String,
  jobPostingUrl: String,
  salaryRange: String,
  notes: String,
  nextStepsDate: Date,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Job', jobSchema);

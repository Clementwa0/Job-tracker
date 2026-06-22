const Resume = require("../models/Resume");

const RESUME_FIELDS = [
  "title", "template", "accent", "contact", "summary",
  "experience", "education", "projects", "skills", "certifications", "languages",
];

function pickResumeFields(body) {
  const out = {};
  for (const key of RESUME_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

function toClient(resume) {
  const obj = resume.toObject();
  return {
    meta: {
      id: String(obj._id),
      name: obj.title,
      createdAt: new Date(obj.createdAt).getTime(),
      updatedAt: new Date(obj.updatedAt).getTime(),
    },
    template: obj.template,
    accent: obj.accent,
    contact: obj.contact,
    summary: obj.summary,
    experience: obj.experience,
    education: obj.education,
    projects: obj.projects,
    skills: obj.skills,
    certifications: obj.certifications,
    languages: obj.languages,
  };
}

exports.listResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json({
      success: true,
      data: resumes.map((r) => ({
        id: String(r._id),
        name: r.title,
        createdAt: new Date(r.createdAt).getTime(),
        updatedAt: new Date(r.updatedAt).getTime(),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list resumes", error: error.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.json({ success: true, data: toClient(resume) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch resume", error: error.message });
  }
};

exports.createResume = async (req, res) => {
  try {
    const data = pickResumeFields(req.body);
    if (!data.title) data.title = "Untitled resume";
    const resume = await Resume.create({ ...data, userId: req.userId });
    res.status(201).json({ success: true, data: toClient(resume) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create resume", error: error.message });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const data = pickResumeFields(req.body);
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.json({ success: true, data: toClient(resume) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update resume", error: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete resume", error: error.message });
  }
};

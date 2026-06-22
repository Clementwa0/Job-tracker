const { generateJobPostingDraft } = require("../services/jobPostingAiService");
const { resolveEmployerCompany } = require("./employerController");

/**
 * POST /api/employer/jobs/ai-generate
 */
exports.generateJobPosting = async (req, res) => {
  try {
    const { input, location: locationHint } = req.body;
    if (!input?.trim()) {
      return res.status(400).json({ success: false, message: "Input is required" });
    }

    const company = await resolveEmployerCompany(req.userId, req.user);

    const data = await generateJobPostingDraft({
      input,
      companyName: company?.name,
      location: locationHint || company?.location,
    });

    res.json({ success: true, data });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status >= 500) console.error("[jobPostingAi]", error);
    res.status(status).json({
      success: false,
      message: error.message || "Failed to generate job posting",
    });
  }
};

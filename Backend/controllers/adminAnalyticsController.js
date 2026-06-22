const { getOverview, getCharts } = require("../services/adminAnalyticsService");

/**
 * GET /api/admin/analytics/overview
 */
exports.getOverview = async (req, res) => {
  try {
    const data = await getOverview();
    res.json({ success: true, data });
  } catch (error) {
    console.error("admin analytics overview:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics overview", error: error.message });
  }
};

/**
 * GET /api/admin/analytics/charts?period=30d
 */
exports.getCharts = async (req, res) => {
  try {
    const data = await getCharts(req.query.period);
    res.json({ success: true, data });
  } catch (error) {
    console.error("admin analytics charts:", error);
    res.status(500).json({ success: false, message: "Failed to load analytics charts", error: error.message });
  }
};

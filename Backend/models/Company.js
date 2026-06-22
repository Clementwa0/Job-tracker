const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    website: String,
    location: String,
    industry: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

companySchema.index({ status: 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Company", companySchema);

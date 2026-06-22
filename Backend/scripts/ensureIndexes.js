/**
 * Ensures MongoDB indexes for Phase 2 models.
 * Run: node scripts/ensureIndexes.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const Company = require("../models/Company");
const JobPosting = require("../models/JobPosting");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Job = require("../models/Jobs");

const models = [Company, JobPosting, AuditLog, Notification, User, Job];

async function main() {
  await connectDB();
  for (const Model of models) {
    await Model.syncIndexes();
    console.log(`Synced indexes for ${Model.modelName}`);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

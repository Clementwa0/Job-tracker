/**
 * Removes legacy platform application data and patches job postings.
 * Run: node scripts/migrateRemoveApplications.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const mongoose = require("mongoose");
const JobPosting = require("../models/JobPosting");
const Job = require("../models/Jobs");

async function main() {
  await connectDB();
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  const hasApplications = collections.some((c) => c.name === "jobapplications");
  if (hasApplications) {
    await db.dropCollection("jobapplications");
    console.log("Dropped jobapplications collection");
  }

  const postings = await JobPosting.find({
    $or: [{ applyMethod: { $exists: false } }, { "applyMethod.value": { $exists: false } }],
  });

  for (const posting of postings) {
    const fallback =
      posting.applyMethod?.type === "email"
        ? { type: "email", value: "careers@example.com" }
        : { type: "external_link", value: "https://example.com/careers" };
    await JobPosting.updateOne(
      { _id: posting._id },
      {
        $set: { applyMethod: posting.applyMethod?.type ? posting.applyMethod : fallback },
        $unset: { applicationCount: "" },
      },
    );
    console.log("Patched posting:", posting.slug);
  }

  await JobPosting.updateMany({}, { $unset: { applicationCount: "" } });
  await Job.updateMany({}, { $unset: { platformApplicationId: "" } });
  console.log("Cleanup complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

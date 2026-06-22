/**
 * Seeds sample companies and published job postings for local dev.
 * Run: node scripts/seedPublicJobs.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const User = require("../models/User");
const Company = require("../models/Company");
const JobPosting = require("../models/JobPosting");
const { buildJobSlug } = require("../utils/slugify");

const SAMPLE_JOBS = [
  {
    company: { name: "Google", slug: "google", industry: "Technology", location: "Nairobi" },
    title: "Software Engineer",
    location: "Nairobi, Kenya",
    jobType: "full-time",
    workMode: "hybrid",
    salaryMin: 120000,
    salaryMax: 180000,
    tags: ["javascript", "react", "node"],
    description: "Build scalable web applications for millions of users.",
    requirements: "3+ years experience with React and Node.js.",
    applyMethod: { type: "external_link", value: "https://careers.google.com/jobs" },
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    company: { name: "Safaricom", slug: "safaricom", industry: "Telecommunications", location: "Nairobi" },
    title: "Frontend Developer",
    location: "Nairobi, Kenya",
    jobType: "full-time",
    workMode: "onsite",
    salaryMin: 80000,
    salaryMax: 120000,
    tags: ["typescript", "react", "tailwind"],
    description: "Join our digital team to deliver customer-facing mobile web experiences.",
    requirements: "Strong TypeScript and modern CSS skills.",
    applyMethod: { type: "email", value: "careers@safaricom.example.com" },
    applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    company: { name: "Andela", slug: "andela", industry: "Technology", location: "Remote" },
    title: "Full Stack Engineer Intern",
    location: "Remote",
    jobType: "internship",
    workMode: "remote",
    salaryMin: 30000,
    salaryMax: 50000,
    tags: ["mongodb", "express", "react"],
    description: "Learn full-stack development while contributing to real client projects.",
    requirements: "Basic knowledge of JavaScript and willingness to learn.",
    applyMethod: { type: "whatsapp", value: "254712345678" },
  },
];

async function getOrCreateSeedUser() {
  let user = await User.findOne({ email: "seed-employer@jobtracker.local" });
  if (!user) {
    user = await User.create({
      name: "Seed Employer",
      email: "seed-employer@jobtracker.local",
      password: "SeedPass123!",
      role: "employer",
      emailVerified: true,
      accountStatus: "active",
    });
    console.log("Created seed employer user:", user.email);
  }
  return user;
}

async function main() {
  await connectDB();
  const user = await getOrCreateSeedUser();

  for (const sample of SAMPLE_JOBS) {
    let company = await Company.findOne({ slug: sample.company.slug });
    if (!company) {
      company = await Company.create({
        ...sample.company,
        description: `${sample.company.name} is hiring on the Job Tracker platform.`,
        website: `https://${sample.company.slug}.example.com`,
        createdBy: user._id,
        status: "approved",
      });
      console.log("Created company:", company.name);
    }

    const slug = buildJobSlug(sample.title, sample.company.name, sample.location);
    const exists = await JobPosting.findOne({ slug });
    if (exists) {
      await JobPosting.updateOne({ _id: exists._id }, { applyMethod: sample.applyMethod });
      console.log("Updated applyMethod for:", slug);
      continue;
    }

    await JobPosting.create({
      title: sample.title,
      slug,
      companyId: company._id,
      description: sample.description,
      requirements: sample.requirements,
      location: sample.location,
      salaryMin: sample.salaryMin,
      salaryMax: sample.salaryMax,
      salaryCurrency: "USD",
      jobType: sample.jobType,
      workMode: sample.workMode,
      tags: sample.tags,
      applyMethod: sample.applyMethod,
      status: "published",
      createdBy: user._id,
      publishedAt: new Date(),
    });
    console.log("Created posting:", slug);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Creates or updates the platform admin user.
 * Run: node scripts/seedAdmin.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const User = require("../models/User");

async function main() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@jobtracker.local";
  const password = process.env.ADMIN_PASSWORD || "AdminPass123!";

  let user = await User.findOne({ email });
  if (user) {
    user.role = "admin";
    user.accountStatus = "active";
    user.emailVerified = true;
    if (password) user.password = password;
    await user.save();
    console.log("Updated admin user:", email);
  } else {
    user = await User.create({
      name: "Platform Admin",
      email,
      password,
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
    });
    console.log("Created admin user:", email);
  }
  console.log("Password:", password);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

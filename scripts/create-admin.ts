
/**
 * Creates or resets a JobTrail admin account.
 *
 * Usage:
 *   ADMIN_PASSWORD='StrongPassword123!' pnpm db:create-admin admin@jobtrail.app "JobTrail Admin"
 *
 * Admin accounts are provisioned manually. There is no self-service admin signup.
 */

export {};

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Environment file does not exist; continue.
  }
}

async function main() {
  const [emailArg, ...nameParts] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;

  if (!emailArg) {
    console.error(
      "Usage: ADMIN_PASSWORD='…' pnpm db:create-admin <email> [name]",
    );
    process.exit(1);
  }

  if (!password) {
    console.error("Missing ADMIN_PASSWORD environment variable.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  const email = emailArg.toLowerCase().trim();

  if (!email || !email.includes("@")) {
    console.error("Please provide a valid admin email address.");
    process.exit(1);
  }

  const name = nameParts.join(" ").trim() || "JobTrail Admin";

  // Import after loading environment variables because the DB module
  // reads DATABASE_URL during module initialization.
  const { db } = await import("../lib/db");
  const { adminUsers } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/auth/password");

  const passwordHash = await hashPassword(password);

  await db
    .insert(adminUsers)
    .values({
      name,
      email,
      passwordHash,
      accountStatus: "active",
    })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: {
        name,
        passwordHash,
        accountStatus: "active",
        updatedAt: new Date(),
      },
    });

  console.log("");
  console.log("✓ Admin account ready");
  console.log(`  Email: ${email}`);
  console.log(`  Name:  ${name}`);
  console.log("");
  console.log("Admin login:");
  console.log("  https://admin.jobtrail.app/login");
  console.log("");

  process.exit(0);
}

main().catch((error) => {
  console.error("");
  console.error("✗ Failed to create admin account.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
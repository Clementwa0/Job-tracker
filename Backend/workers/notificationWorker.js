require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const connectDB = require("../config/database");
const { processPendingEmailNotifications } = require("../services/notificationService");

async function main() {
  await connectDB();
  const processed = await processPendingEmailNotifications();
  console.log(`Processed ${processed} email notification(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

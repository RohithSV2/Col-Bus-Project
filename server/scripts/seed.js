import dotenv from "dotenv";
import { connectDB, store, saveStoreToDisk } from "../src/db.js";
import {
  initialRoutes,
  getInitialUsers,
  getInitialPasses,
  initialRenewalRequests,
  initialIssueReports,
  initialVerificationLogs,
  initialNotifications,
} from "../src/data/initialData.js";

dotenv.config();

const runSeed = async () => {
  console.log("Seeding SmartBus database records...");
  store.users = getInitialUsers();
  store.routes = [...initialRoutes];
  store.passes = getInitialPasses();
  store.renewals = [...initialRenewalRequests];
  store.issues = [...initialIssueReports];
  store.logs = [...initialVerificationLogs];
  store.notifications = [...initialNotifications];

  saveStoreToDisk();
  console.log("Seeded successfully:");
  console.log(`- Users: ${store.users.length}`);
  console.log(`- Passes: ${store.passes.length}`);
  console.log(`- Routes: ${store.routes.length}`);
  console.log(`- Renewals: ${store.renewals.length}`);
  console.log(`- Issues: ${store.issues.length}`);
  console.log(`- Verification Logs: ${store.logs.length}`);
  process.exit(0);
};

runSeed();

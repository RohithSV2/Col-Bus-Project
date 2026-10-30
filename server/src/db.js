import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  initialRoutes,
  getInitialUsers,
  getInitialPasses,
  initialRenewalRequests,
  initialIssueReports,
  initialVerificationLogs,
  initialNotifications,
} from "./data/initialData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data_store.json");

let isMongoConnected = false;

// Embedded in-memory store initialized with rich demo data
export const store = {
  users: [],
  routes: [],
  passes: [],
  renewals: [],
  issues: [],
  logs: [],
  notifications: [],
};

// Save store to disk for persistence across server restarts when offline
export const saveStoreToDisk = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save store to disk:", err.message);
  }
};

// Load store from disk or initialize from demo data
export const initStore = () => {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(content);
      store.users = data.users || [];
      store.routes = data.routes || [];
      store.passes = data.passes || [];
      store.renewals = data.renewals || [];
      store.issues = data.issues || [];
      store.logs = data.logs || [];
      store.notifications = data.notifications || [];
      console.log("Loaded SmartBus data store from persistent disk storage.");
      return;
    } catch (err) {
      console.warn("Failed to load existing data file, re-initializing seeds:", err.message);
    }
  }

  // Seed default data
  store.users = getInitialUsers();
  store.routes = [...initialRoutes];
  store.passes = getInitialPasses();
  store.renewals = [...initialRenewalRequests];
  store.issues = [...initialIssueReports];
  store.logs = [...initialVerificationLogs];
  store.notifications = [...initialNotifications];
  saveStoreToDisk();
  console.log("Initialized SmartBus data store with rich demo seed records.");
};

export const connectDB = async () => {
  initStore();

  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("YOUR_MONGODB_CONNECTION_STRING")) {
    console.log("[SmartBus Database] Running in Embedded Resilient Storage mode (zero external database setup required).");
    return false;
  }

  try {
    // Attempt Mongoose connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(" MongoDB Connected Successfully: " + mongoose.connection.host);
    return true;
  } catch (err) {
    console.warn(`[SmartBus Database] MongoDB connection failed (${err.message}). Falling back to Embedded Resilient Storage.`);
    isMongoConnected = false;
    return false;
  }
};

export const getDbStatus = () => ({
  mode: isMongoConnected ? "MongoDB Atlas" : "Embedded Resilient Store",
  isMongoConnected,
  stats: {
    usersCount: store.users.length,
    passesCount: store.passes.length,
    routesCount: store.routes.length,
    renewalsCount: store.renewals.length,
    issuesCount: store.issues.length,
    logsCount: store.logs.length,
  },
});

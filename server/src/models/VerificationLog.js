import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
    },
    passId: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    verifiedBy: {
      type: String,
      required: true,
    },
    routeId: {
      type: String,
      required: true,
    },
    routeName: {
      type: String,
      required: true,
    },
    busNumber: {
      type: String,
      required: true,
    },
    verificationTime: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ["VALID", "INVALID", "EXPIRED", "SUSPENDED"],
      required: true,
    },
    scanMethod: {
      type: String,
      enum: ["qr_camera", "qr_file", "manual_id", "simulated_demo"],
      default: "qr_camera",
    },
    location: {
      type: String,
      default: "Bus Entrance",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.VerificationLog || mongoose.model("VerificationLog", verificationLogSchema);

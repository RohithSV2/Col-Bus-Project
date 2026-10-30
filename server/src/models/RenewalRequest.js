import mongoose from "mongoose";

const renewalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    passId: {
      type: String,
      required: true,
      ref: "BusPass",
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    currentExpiryDate: {
      type: String,
      required: true,
    },
    requestedExtensionDays: {
      type: Number,
      default: 180,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestDate: {
      type: String,
      required: true,
    },
    reviewedDate: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    comments: {
      type: String,
      default: "",
    },
    receiptNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.RenewalRequest || mongoose.model("RenewalRequest", renewalRequestSchema);

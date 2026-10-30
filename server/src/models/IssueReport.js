import mongoose from "mongoose";

const issueReportSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    passId: {
      type: String,
      default: "N/A",
    },
    issueType: {
      type: String,
      enum: ["lost_pass", "damaged_pass", "wrong_route", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.IssueReport || mongoose.model("IssueReport", issueReportSchema);

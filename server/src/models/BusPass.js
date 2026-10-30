import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, default: "" },
});

const busPassSchema = new mongoose.Schema(
  {
    passId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      ref: "User",
    },
    studentName: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      default: "Apex Institute of Technology",
    },
    course: {
      type: String,
      default: "B.Tech",
    },
    routeId: {
      type: String,
      required: true,
      ref: "Route",
    },
    routeName: {
      type: String,
      required: true,
    },
    busNumber: {
      type: String,
      required: true,
    },
    pickupStop: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      default: "",
    },
    issuedDate: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "suspended", "pending", "rejected"],
      default: "pending",
    },
    qrVerificationToken: {
      type: String,
      required: true,
      unique: true,
    },
    passType: {
      type: String,
      default: "Semester Pass",
    },
    issuedBy: {
      type: String,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    history: [historySchema],
  },
  { timestamps: true }
);

export default mongoose.models.BusPass || mongoose.model("BusPass", busPassSchema);

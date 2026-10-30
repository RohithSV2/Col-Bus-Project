import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "conductor", "admin"],
      default: "student",
    },
    institution: {
      type: String,
      default: "Apex Institute of Technology",
    },
    course: {
      type: String,
      default: "Undergraduate Degree",
    },
    year: {
      type: String,
      default: "1st Year",
    },
    phone: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    assignedRouteId: {
      type: String,
      default: "",
    },
    pickupStop: {
      type: String,
      default: "",
    },
    photoUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

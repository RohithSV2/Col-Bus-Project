import mongoose from "mongoose";

const stopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  stopOrder: { type: Number, required: true },
  morningTime: { type: String, required: true },
  eveningTime: { type: String, required: true },
});

const routeSchema = new mongoose.Schema(
  {
    routeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    routeName: {
      type: String,
      required: true,
    },
    busNumber: {
      type: String,
      required: true,
      uppercase: true,
    },
    driverName: {
      type: String,
      default: "Assigned Driver",
    },
    driverPhone: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      default: 50,
    },
    stops: [stopSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Route || mongoose.model("Route", routeSchema);

import mongoose, { Schema } from "mongoose";
import { ITechnician } from "../interfaces/Models/Itechnician";

const technicianSchema: Schema<ITechnician> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Blocked"],
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    yearsOfExperience: {
      type: Number,
    },
    Designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "designation",
    },
    About: {
      type: String,
    },
    image: {
      type: String,
    },
    certificates: [
      {
        type: String,
      },
    ],
    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy", "Offline"],
    },
  },
  { timestamps: true }
);

const technician = mongoose.model<ITechnician>("technician", technicianSchema);

export default technician;

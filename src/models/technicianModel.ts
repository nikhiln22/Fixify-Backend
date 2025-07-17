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
      enum: ["Active", "Blocked"],
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
      ref: "jobDesignation",
    },
    About: {
      type: String,
    },
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    address: {
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
  },
  { timestamps: true }
);

technicianSchema.index({ longitude: 1, latitude: 1 });

const technician = mongoose.model<ITechnician>("technician", technicianSchema);

export default technician;

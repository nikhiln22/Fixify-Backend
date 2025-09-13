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
    expiresAt: {
      type: Date,
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
  },
  { timestamps: true }
);

technicianSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 900 });

const technician = mongoose.model<ITechnician>("technician", technicianSchema);

export default technician;

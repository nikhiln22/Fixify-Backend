import mongoose, { Schema } from "mongoose";
import { Itechnician } from "../interfaces/Models/Itechnician";

const technicianSchema: Schema<Itechnician> = new Schema(
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
      type: String,
    },
    About: {
      type: String,
    },
    city: {
      type: String,
    },
    preferredWorkLocation: {
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

const technician = mongoose.model<Itechnician>("technician", technicianSchema);

export default technician;

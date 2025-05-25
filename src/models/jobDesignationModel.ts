import mongoose, { Schema } from "mongoose";
import { IjobDesignation } from "../interfaces/Models/IjobDesignation";

const jobDesignationSchema: Schema<IjobDesignation> = new Schema(
  {
    designation: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const jobDesignation = mongoose.model<IjobDesignation>(
  "jobDesignation",
  jobDesignationSchema
);

export default jobDesignation;

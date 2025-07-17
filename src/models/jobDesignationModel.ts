import mongoose, { Schema } from "mongoose";
import { IJobDesignation } from "../interfaces/Models/IjobDesignation";

const jobDesignationSchema: Schema<IJobDesignation> = new Schema(
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

const jobDesignation = mongoose.model<IJobDesignation>(
  "jobDesignation",
  jobDesignationSchema
);

export default jobDesignation;

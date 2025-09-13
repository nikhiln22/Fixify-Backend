import mongoose, { Schema } from "mongoose";
import { IDesignation } from "../interfaces/Models/Idesignation";

const designationSchema: Schema<IDesignation> = new Schema(
  {
    designation: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const designation = mongoose.model<IDesignation>(
  "designation",
  designationSchema
);

export default designation;

import mongoose, { Schema } from "mongoose";
import { IService } from "../interfaces/Models/Iservice";

const serviceSchema: Schema<IService> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    designation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "designation",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    serviceType: {
      type: String,
      enum: ["fixed", "hourly"],
      required: true,
    },
    estimatedTime: {
      type: Number,
    },
    hourlyRate: {
      type: Number,
    },
    maxHours: {
      type: Number,
    },
  },
  { timestamps: true }
);

const service = mongoose.model<IService>("service", serviceSchema);

export default service;

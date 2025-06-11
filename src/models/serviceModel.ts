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
      required: true,
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
      ref: "jobDesignation",
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const service = mongoose.model<IService>("service", serviceSchema);

export default service;

import { IService } from "../interfaces/Models/Iservice";
import mongoose, { Schema } from "mongoose";

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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const service = mongoose.model<IService>("category", serviceSchema);

export default service;

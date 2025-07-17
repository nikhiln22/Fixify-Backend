import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interfaces/Models/Icategory";

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const category = mongoose.model<ICategory>("category", categorySchema);

export default category;

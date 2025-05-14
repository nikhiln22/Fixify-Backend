import { Icategory } from "../interfaces/Models/Icategory";
import mongoose, { Schema } from "mongoose";

const categorySchema: Schema<Icategory> = new Schema(
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

const category = mongoose.model<Icategory>("category", categorySchema);

export default category;

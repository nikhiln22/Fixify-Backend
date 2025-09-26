import mongoose, { Schema } from "mongoose";
import { IPart } from "../interfaces/Models/Ipart";

const partSchema: Schema<IPart> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Part = mongoose.model<IPart>("part", partSchema);

export default Part;

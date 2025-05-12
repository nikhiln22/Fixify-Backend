import mongoose, { Schema } from "mongoose";
import { ICityLocation } from "../interfaces/Models/IcityLocation";

const locationSchema: Schema<ICityLocation> = new Schema(
  {
    city: {
      type: String,
      unique: true,
      required: true,
    },
    locations: [
      {
        name: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Location = mongoose.model<ICityLocation>("location", locationSchema);

export default Location;

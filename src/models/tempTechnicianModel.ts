import mongoose, { Schema } from "mongoose";
import { ItempTechnician } from "../interfaces/Models/ItempTechnician";

const tempTechnicianSchema: Schema<ItempTechnician> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

tempTechnicianSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 900 });

const tempTechnician = mongoose.model<ItempTechnician>(
  "tempTechnician",
  tempTechnicianSchema
);

export default tempTechnician;

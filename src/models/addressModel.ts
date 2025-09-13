import mongoose, { Schema } from "mongoose";
import { IAddress } from "../interfaces/Models/Iaddress";

const addressSchema: Schema<IAddress> = new Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerModel",
    },
    ownerModel: {
      type: String,
      enum: ["user", "technician"],
      required: true,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work"],
    },
    fullAddress: {
      type: String,
      required: true,
    },
    houseNumber: {
      type: String,
    },
    longitude: {
      type: Number,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    landmark: {
      type: String,
    },
  },
  { timestamps: true }
);

addressSchema.index({ longitude: 1, latitude: 1 });

const address = mongoose.model<IAddress>("address", addressSchema);

export default address;

import mongoose, { Schema, Types } from "mongoose";
import { IUserAddress } from "../interfaces/Models/Iaddress";

const userAddressSchema: Schema<IUserAddress> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work"],
      default: "Home",
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

userAddressSchema.index({ userId: 1 });
userAddressSchema.index({ longitude: 1, latitude: 1 });

const userAddress = mongoose.model<IUserAddress>(
  "UserAddress",
  userAddressSchema
);

export default userAddress;

import mongoose, { Schema } from "mongoose";
import { ITempUser } from "../interfaces/Models/ItempUser";

const tempUserSchema: Schema<ITempUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

tempUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 900 });

const tempUser = mongoose.model<ITempUser>("tempUser", tempUserSchema);

export default tempUser;

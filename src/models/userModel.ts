import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/Models/Iuser";

const userSchema: Schema<IUser> = new Schema(
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
    status: {
      type: String,
      enum: ["Active", "Blocked"],
    },
    expiresAt: {
      type: Date,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 900 });

const user = mongoose.model<IUser>("user", userSchema);

export default user;

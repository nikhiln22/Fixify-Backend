import mongoose, { Schema } from "mongoose";
import { Iuser } from "../interfaces/Models/Iuser";

const userSchema: Schema<Iuser> = new Schema(
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
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<Iuser>("User", userSchema);

export default User;

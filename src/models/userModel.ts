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
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const user = mongoose.model<IUser>("user", userSchema);

export default user;

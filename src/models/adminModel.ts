import mongoose, { Schema } from "mongoose";
import { IAdmin } from "../interfaces/Models/Iadmin";

const adminSchema: Schema<IAdmin> = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model<IAdmin>("admin", adminSchema);

export default Admin;

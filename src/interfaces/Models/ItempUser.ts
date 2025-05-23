import mongoose, { Document } from "mongoose";

export interface ItempUser extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  image?: string;
  otp: string;
  otpExpiresAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

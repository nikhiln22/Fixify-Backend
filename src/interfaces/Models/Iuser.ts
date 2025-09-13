import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  role: "USER" | "TECHNICIAN" | "ADMIN";
  status: "Pending" | "Active" | "Blocked";
  is_verified: boolean;
  email_verified: boolean;
  expiresAt?: Date;
  image?: string;
  yearsOfExperience?: number;
  Designation?: string;
  About?: string;
  certificates?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

import { Document, Types } from "mongoose";

export interface ITechnician extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  is_verified: boolean;
  status?: string;
  yearsOfExperience?: number;
  Designation?: Types.ObjectId;
  About?: string;
  image?: string;
  certificates?: string[];
  availabilityStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

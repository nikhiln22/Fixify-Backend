import { Document, Types } from "mongoose";

export interface Itechnician extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  is_verified: boolean;
  yearsOfExperience?: number;
  Designation?: Types.ObjectId;
  About?: string;
  image?: string;
  certificates?: string[];
  longitude?: number;
  latitude?: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
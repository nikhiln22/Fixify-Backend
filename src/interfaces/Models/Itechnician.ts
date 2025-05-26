import { Document } from "mongoose";

export interface Itechnician extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  is_verified: boolean;
  yearsOfExperience?: number;
  Designation?: string;
  About?: string;
  image?: string;
  certificates?: string[];
  longitude?: number;
  latitude?: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
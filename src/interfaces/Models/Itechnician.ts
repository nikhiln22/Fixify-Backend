import { Document } from "mongoose";

export interface Itechnician extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  is_verified: boolean;
  yearsOfExperience?: number;
  jobDesignation?: string;
  About?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

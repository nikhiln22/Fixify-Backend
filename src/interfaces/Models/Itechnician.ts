import { Document, Types } from "mongoose";
import { ISubscriptionPlan } from "./IsubscriptionPlan";

export interface ITechnician extends Document {
  _id: string;
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
  SubscriptionPlanId?: string | ISubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

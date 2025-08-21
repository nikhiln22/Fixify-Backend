import { Document, Types } from "mongoose";
import { ISubscriptionPlan } from "./IsubscriptionPlan";

export interface ISubscriptionPlanHistory extends Document {
  _id: string;
  technicianId: Types.ObjectId;
  subscriptionPlanId: Types.ObjectId;
  amount: number;
  status: "Active" | "Expired";
  paymentId?: Types.ObjectId;
  expiryDate?: Date;
  nextUpgrade?: {
    planId: Types.ObjectId | ISubscriptionPlan;
    amount: number;
    paymentId?: Types.ObjectId;
  };
  hasNextUpgrade: boolean;
  createdAt: Date;
  updatedAt: Date;
}

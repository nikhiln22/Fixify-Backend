import { Document, Types } from "mongoose";

export interface ISubscriptionPlanHistory extends Document {
  _id: string;
  technicianId: Types.ObjectId;
  subscriptionPlanId: Types.ObjectId;
  amount: number;
  status: "Active" | "Expired";
  paymentId?: Types.ObjectId;
  createdAt: Date;
  expiredAt: Date;
}

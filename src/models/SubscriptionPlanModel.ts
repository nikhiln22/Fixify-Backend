import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import mongoose, { Schema } from "mongoose";

const SubscriptrionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    planName: {
      type: String,
      enum: ["BASIC", "PRO", "ELITE"],
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
    monthlyPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const subscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "subscriptionPlan",
  SubscriptrionPlanSchema
);

export default subscriptionPlan;

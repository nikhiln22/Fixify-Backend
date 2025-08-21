import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import mongoose, { Schema } from "mongoose";

const SubscriptrionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
    },
    WalletCreditDelay: {
      type: Number,
      required: true,
    },
    profileBoost: {
      type: Boolean,
      default: false,
    },
    durationInMonths: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const subscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "subscriptionPlan",
  SubscriptrionPlanSchema
);

export default subscriptionPlan;

import mongoose, { Schema } from "mongoose";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";

const subscriptionPlanHistorySchema: Schema<ISubscriptionPlanHistory> =
  new Schema(
    {
      technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "technician",
        required: true,
      },
      subscriptionPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subscriptionPlan",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payment",
      },
      expiryDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["Active", "Expired"],
      },
      nextUpgrade: {
        planId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "subscriptionPlan",
        },
        amount: {
          type: Number,
        },
        paymentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "payment",
        },
      },
      hasNextUpgrade: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
  );

const subscriptionPlanHistory = mongoose.model<ISubscriptionPlanHistory>(
  "subscriptionPlanHistory",
  subscriptionPlanHistorySchema
);

export default subscriptionPlanHistory;

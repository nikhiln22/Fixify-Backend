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
      status: {
        type: String,
        enum: ["Active", "Expired"],
      },
    },
    { timestamps: true }
  );

const subscriptionPlanHistory = mongoose.model<ISubscriptionPlanHistory>(
  "subscriptionPlanHistory",
  subscriptionPlanHistorySchema
);

export default subscriptionPlanHistory;

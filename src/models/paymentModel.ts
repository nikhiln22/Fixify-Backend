import { IPayment } from "../interfaces/Models/Ipayment";
import mongoose, { Schema } from "mongoose";

const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptionPlan",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    fixifyShare: {
      type: Number,
    },
    technicianShare: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Refunded"],
      required: true,
    },
    technicianPaid: {
      type: Boolean,
      default: false,
    },
    technicianPaidAt: {
      type: Date,
    },
    refundStatus: {
      type: String,
      enum: ["Not Refunded", "Refunded"],
      default: "Not Refunded",
    },
    refundDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const payment = mongoose.model<IPayment>("payment", paymentSchema);

export default payment;

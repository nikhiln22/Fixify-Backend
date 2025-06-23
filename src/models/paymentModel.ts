import { IPayment } from "../interfaces/Models/Ipayment";
import mongoose, { Schema, Types } from "mongoose";

const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    fixifyShare: {
      type: Number,
      required: true,
    },
    technicianShare: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

const payment = mongoose.model<IPayment>("payment", paymentSchema);

export default payment;

import { IBooking } from "../interfaces/Models/Ibooking";
import mongoose, { Schema, Model } from "mongoose";

const bookingSchema: Schema<IBooking> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
      required: true,
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAddress",
      required: true,
    },
    timeSlotId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "online", "Wallet"],
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "cancelled", "completed"],
      default: "Pending",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "success", "Failed"],
      default: "Pending",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;

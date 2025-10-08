import { IBooking } from "../interfaces/Models/Ibooking";
import mongoose, { Schema } from "mongoose";

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
      ref: "address",
      required: true,
    },
    timeSlotId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "timeSlot",
        required: true,
      },
    ],
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    bookingAmount: {
      type: Number,
      required: true,
    },
    actualDuration: {
      type: Number,
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Booked", "In Progress", "Cancelled", "Completed"],
      required: true,
    },
    hasReplacementParts: {
      type: Boolean,
      default: false,
    },
    replacementPartsApproved: {
      type: Boolean,
      default: false,
    },
    finalServiceAmount: {
      type: Number,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "technician"],
    },
    cancellationDate: {
      type: Date,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;

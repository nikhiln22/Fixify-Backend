import mongoose, { Schema } from "mongoose";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";

const timeSlotSchema: Schema<ITimeSlot> = new Schema(
  {
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    reservationExpiry: {
      type: Date,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const timeSlot = mongoose.model<ITimeSlot>("timeSlot", timeSlotSchema);

export default timeSlot;

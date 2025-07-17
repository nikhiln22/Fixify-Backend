import { IOffer } from "../interfaces/Models/Ioffers";
import mongoose, { Schema, Types } from "mongoose";

const offerSchema: Schema<IOffer> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    offer_type: {
      type: String,
      enum: ["global", "service_category", "first_time_user"],
      required: true,
    },
    discount_type: {
      type: String,
      enum: ["percentage", "flat_amount"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    max_discount: {
      type: Number,
    },
    min_booking_amount: {
      type: Number,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service",
    },
    status: {
      type: Boolean,
      default: true,
    },
    valid_until: {
      type: Date,
    },
  },
  { timestamps: true }
);

const offer = mongoose.model<IOffer>("offer", offerSchema);

export default offer;

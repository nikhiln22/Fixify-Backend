import { ICoupon } from "../interfaces/Models/Icoupon";
import mongoose, { Schema } from "mongoose";

const couponSchema: Schema<ICoupon> = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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
    used_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    valid_until: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const coupon = mongoose.model<ICoupon>("coupon", couponSchema);

export default coupon;

import { Document, Types } from "mongoose";

export interface ICoupon extends Document {
  _id: string;
  code: string;
  title: string;
  description: string;
  discount_type: "percentage" | "flat_amount";
  discount_value: number;
  max_discount?: number;
  min_booking_amount?: number;
  used_by_users?: Types.ObjectId[];
  valid_until?: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

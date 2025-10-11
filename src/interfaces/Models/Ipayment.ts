import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  technicianId: Types.ObjectId;
  subscriptionPlanId?: Types.ObjectId;
  originalAmount?: number;
  amountPaid: number;
  offerId?: Types.ObjectId;
  couponId?: Types.ObjectId;
  offerDiscount?: number;
  couponDiscount?: number;
  fixifyShare?: number;
  technicianShare?: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Partial Paid" | "Paid" | "Refunded";
  partsAmount?: number;
  technicianPaid?: boolean;
  technicianPaidAt?: Date;
  refundStatus?: "Not Refunded" | "Refunded";
  refundDate?: Date;
  refundAmount?: number;
  creditReleaseDate?: Date;
  advanceAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

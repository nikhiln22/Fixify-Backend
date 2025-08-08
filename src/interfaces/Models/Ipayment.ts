import { Types, Document } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  technicianId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  subscriptionPlanId?: Types.ObjectId;
  originalAmount?: number;
  amountPaid: number;
  offerId?: Types.ObjectId;
  couponId?: Types.ObjectId;
  fixifyShare?: number;
  technicianShare?: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Paid" | "Refunded";
  technicianPaid?: boolean;
  technicianPaidAt?: Date;
  refundStatus: "Not Refunded" | "Refunded";
  refundAmount?: number;
  refundDate?: Date;
  creditReleaseDate?: Date;
}

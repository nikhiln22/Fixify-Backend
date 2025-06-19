import { Types, Document } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  bookingId: Types.ObjectId;
  totalAmount: number;
  fixifyShare: number;
  technicianShare: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus:"paid" | "refunded";
  technicianPaid:boolean;
  technicianPaidAt:Date;
  refundStatus:"not refunded" | "refunded";
  refundDate?:Date;
}

import { Types, Document } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  bookingId: Types.ObjectId;
  amountPaid: number;
  fixifyShare: number;
  technicianShare: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Paid" | "Refunded";
  technicianPaid: boolean;
  technicianPaidAt: Date;
  refundStatus: "Not Refunded" | "Refunded";
  refundDate?: Date;
}

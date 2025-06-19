import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  serviceId: Types.ObjectId;
  addressId: Types.ObjectId;
  timeSlotId: string;
  totalAmount: number;
  bookingStatus: "Pending" | "Booked" | "Cancelled" | "Completed";
  paymentStatus?: "Paid" | "Refunded"
  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId; 
  technicianId: Types.ObjectId;
  serviceId: Types.ObjectId;
  addressId: Types.ObjectId;
  timeSlotId: string;
  date: string;
  totalAmount: number;
  paymentMethod: "Cash" | "online" | "Wallet";
  bookingStatus: "Pending" | "cancelled" | "completed";
  paymentStatus: "Pending" | "success" | "Failed";
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

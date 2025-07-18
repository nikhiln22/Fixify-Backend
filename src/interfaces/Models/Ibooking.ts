import { Document, Types } from "mongoose";
import { IService } from "./Iservice";
import { IPayment } from "./Ipayment";
import { ITimeSlot } from "./ItimeSlot";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  serviceId: Types.ObjectId | IService;
  addressId: Types.ObjectId;
  paymentId: Types.ObjectId | IPayment;
  timeSlotId: Types.ObjectId | ITimeSlot;
  bookingAmount: number;
  bookingStatus: "Pending" | "Booked" | "Cancelled" | "Completed";
  cancellationReason: string;
  cancelledBy: "user" | "technician";
  cancellationDate: Date;
  isRated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

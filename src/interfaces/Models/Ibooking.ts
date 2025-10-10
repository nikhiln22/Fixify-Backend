import { Document, Types } from "mongoose";
import { IService } from "./Iservice";
import { IPayment } from "./Ipayment";
import { ITimeSlot } from "./ItimeSlot";
import { IPart } from "./Ipart";

export interface IBooking extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  serviceId: Types.ObjectId | IService;
  addressId: Types.ObjectId;
  paymentId: Types.ObjectId | IPayment;
  timeSlotId: Types.ObjectId[] | ITimeSlot[];
  bookingAmount: number;
  serviceStartTime?: Date;
  serviceEndTime?: Date;
  actualDuration?: number;
  bookingStatus:
    | "Pending"
    | "Booked"
    | "In Progress"
    | "Payment Pending"
    | "Cancelled"
    | "Completed";
  hasReplacementParts?: boolean;
  replacementPartsApproved?: boolean | null;
  replacementParts?: Types.ObjectId[] | IPart[];
  partsQuantities?: Map<string, number>;
  totalPartsAmount?: number;
  finalServiceAmount?: number;
  cancellationReason?: string;
  cancelledBy?: "user" | "technician";
  cancellationDate?: Date;
  partsRejectionReason?: Date;
  isRated: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";

export interface ITimeSlot extends Document {
  _id: Types.ObjectId;
  technicianId: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isAvailable: boolean;
  reservationExpiry?: Date;
  isReserved: boolean;
  reservedBy?: Types.ObjectId;
}

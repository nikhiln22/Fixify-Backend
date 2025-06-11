import { Document, Types } from "mongoose";

export interface ITimeSlot extends Document {
  technicianId: Types.ObjectId;
  date: string;
  startTime?: string;
  endTime?: string;
  isBooked?: boolean;
  isAvailable?:boolean;
}

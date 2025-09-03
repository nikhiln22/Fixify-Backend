import { Document, Types } from "mongoose";

export interface IChat extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  messageText: string;
  senderType: string;
  createdAt: Date;
  updatedAt: Date;
}

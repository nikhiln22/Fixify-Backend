import { Document, Types } from "mongoose";

export interface INotification extends Document {
  _id: string;
  recipientId: Types.ObjectId;
  recipientType: "user" | "technician" | "admin";
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

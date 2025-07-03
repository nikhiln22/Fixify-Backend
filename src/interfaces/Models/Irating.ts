import { Document, Types } from "mongoose";

export interface IRating extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  rating: number;
  review?: string;
  ratingStatus: "Active" | "Hidden";
  createdAt: Date;
  updatedAt: Date;
}

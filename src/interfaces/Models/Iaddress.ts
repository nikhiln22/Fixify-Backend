import { Document, Types } from "mongoose";

export interface IUserAddress extends Document {
  _id: string;
  userId: Types.ObjectId;
  addressType: "Home" | "Work";
  fullAddress: string;
  houseNumber?: string;
  longitude: number;
  latitude: number;
  landmark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

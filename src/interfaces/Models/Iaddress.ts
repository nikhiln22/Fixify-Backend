import { Document, Types } from "mongoose";

export interface IAddress extends Document {
  _id: string;
  ownerId: Types.ObjectId;
  ownerModel: "user" | "technician";
  addressType?: "Home" | "Work";
  fullAddress: string;
  houseNumber?: string;
  longitude: number;
  latitude: number;
  landmark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

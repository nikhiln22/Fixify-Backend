import { Document } from "mongoose";

export interface ICityLocation extends Document {
  city: string;
  locations: {
    name: string;
    pincode: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

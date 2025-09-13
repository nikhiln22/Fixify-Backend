import { Document, Types } from "mongoose";

export interface IService extends Document {
  _id: string;
  name: string;
  image: string;
  description: string;
  category: Types.ObjectId;
  designation: Types.ObjectId;
  status: string;
  serviceType: "fixed" | "hourly";
  price?: number;
  estimatedTime?: number;
  hourlyRate?: number;
  maxHours?: number;
}

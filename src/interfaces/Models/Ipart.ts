import { Types, Document } from "mongoose";

export interface IPart extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  services: Types.ObjectId[];
  status: "Active" | "Blocked";
  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";

export interface IService extends Document {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: Types.ObjectId;
  designation: Types.ObjectId;
  status: string;
}

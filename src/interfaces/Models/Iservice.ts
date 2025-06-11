import { Document, Types } from "mongoose";

export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  price: number;
  image: string;
  description: string;
  category: Types.ObjectId;
  designation: Types.ObjectId;
  status: boolean;
}

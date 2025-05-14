import { Document,Types } from "mongoose";

export interface IService extends Document {
  name: string;
  price: number;
  image: string;
  description: string;
  category: Types.ObjectId;
  status: boolean;
}

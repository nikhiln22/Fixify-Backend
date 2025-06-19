import { Document } from "mongoose";

export interface Iuser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  status: boolean;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

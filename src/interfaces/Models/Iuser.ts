import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  is_verified: boolean;
  expiresAt: Date;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

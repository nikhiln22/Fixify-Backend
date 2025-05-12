import { Document } from "mongoose";

export interface ItempTechnician extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

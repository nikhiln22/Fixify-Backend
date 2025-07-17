import { Document } from "mongoose";

export interface ITempTechnician extends Document {
  username: string;
  email: string;
  password: string;
  phone: number;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

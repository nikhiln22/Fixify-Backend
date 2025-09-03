import { Types, Document } from "mongoose";

export interface IWallet extends Document {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  ownerType: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

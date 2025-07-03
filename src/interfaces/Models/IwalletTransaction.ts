import { Types, Document } from "mongoose";

export interface IWalletTransaction extends Document {
  _id: Types.ObjectId;
  ownerId: string | Types.ObjectId;
  walletId: string | Types.ObjectId;
  ownerType: "user" | "technician";
  type: "Credit" | "Debit";
  description: string;
  amount: number;
  referenceId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

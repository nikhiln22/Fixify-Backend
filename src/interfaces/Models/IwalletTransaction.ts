import { Types, Document } from "mongoose";

export interface IWalletTransaction extends Document {
  _id: Types.ObjectId;
  userId: string | Types.ObjectId;
  walletId: string | Types.ObjectId;
  type: "Credit" | "Debit";
  description: string;
  amount: number;
  referenceId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

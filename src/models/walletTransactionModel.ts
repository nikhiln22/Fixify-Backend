import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";
import mongoose, { Schema, Types } from "mongoose";


const WalletTransactionSchema: Schema<IWalletTransaction> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["Credit", "Debit"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
    },
  },
  { timestamps: true }
);

const walletTransaction = mongoose.model<IWalletTransaction>(
  "walletTransaction",
  WalletTransactionSchema
);

export default walletTransaction;

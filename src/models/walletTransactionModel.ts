import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";
import mongoose, { Schema, Types } from "mongoose";

const WalletTransactionSchema: Schema<IWalletTransaction> = new Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      required: true,
    },
    ownerType: {
      type: String,
      enum: ["user", "technician"],
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

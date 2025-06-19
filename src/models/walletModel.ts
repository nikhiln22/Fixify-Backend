import { IWallet } from "../interfaces/Models/Iwallet";
import mongoose, { Schema } from "mongoose";

const walletSchema: Schema<IWallet> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const wallet = mongoose.model<IWallet>("wallet", walletSchema);

export default wallet;

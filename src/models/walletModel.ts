import { IWallet } from "../interfaces/Models/Iwallet";
import mongoose, { Schema } from "mongoose";

const walletSchema: Schema<IWallet> = new Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    ownerType: {
      type: String,
      enum: ["user", "technician"],
      required: true
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
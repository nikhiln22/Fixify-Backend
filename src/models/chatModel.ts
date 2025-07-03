import { IChat } from "../interfaces/Models/Ichat";
import mongoose, { Schema } from "mongoose";

const chatSchema: Schema<IChat> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    messageText: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "technician"],
      required: true,
    },
  },
  { timestamps: true }
);

const chat = mongoose.model<IChat>("chat", chatSchema);

export default chat;

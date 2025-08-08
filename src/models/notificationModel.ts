import { INotification } from "../interfaces/Models/Inotification";
import mongoose, { Schema } from "mongoose";

const notificationSchema: Schema<INotification> = new Schema(
  {
    recipientType: {
      type: String,
      enum: ["user", "admin", "technician"],
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: 1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

const notification = mongoose.model<INotification>(
  "notification",
  notificationSchema
);

export default notification;

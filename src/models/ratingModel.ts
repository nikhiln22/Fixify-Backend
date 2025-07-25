import mongoose, { Schema } from "mongoose";
import { IRating } from "../interfaces/Models/Irating";

const ratingSchema: Schema<IRating> = new Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "technician",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
    ratingStatus: {
      type: String,
      enum: ["Active", "Hidden"],
      default: "Active",
    },
  },
  { timestamps: true }
);

ratingSchema.index({ technicianId: 1, createdAt: -1 });
ratingSchema.index({ bookingId: 1 }, { unique: true });

const rating = mongoose.model<IRating>("Rating", ratingSchema);

export default rating;

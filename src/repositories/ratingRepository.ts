import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IRating } from "../interfaces/Models/Irating";
import Rating from "../models/ratingModel";
import { IRatingRepository } from "../interfaces/Irepositories/IratingRepository";
import { Types } from "mongoose";

@injectable()
export class RatingRepository
  extends BaseRepository<IRating>
  implements IRatingRepository
{
  constructor() {
    super(Rating);
  }

  async createRating(data: {
    userId: string;
    technicianId: string;
    serviceId: string;
    bookingId: string;
    rating: number;
    review?: string;
  }): Promise<IRating> {
    try {
      console.log("Creating rating in repository:", data);

      const ratingData = {
        userId: new Types.ObjectId(data.userId),
        technicianId: new Types.ObjectId(data.technicianId),
        serviceId: new Types.ObjectId(data.serviceId),
        bookingId: new Types.ObjectId(data.bookingId),
        rating: data.rating,
        review: data.review?.trim() || "",
      };

      const newRating = await this.create(ratingData);
      console.log("Rating created successfully:", newRating);

      return newRating;
    } catch (error) {
      console.error("Error in createRating repository:", error);
      throw error;
    }
  }

  async getRatingByBookingId(bookingId: string): Promise<IRating | null> {
    try {
      console.log("Fetching rating for booking ID:", bookingId);

      const rating = await this.model
        .findOne({ bookingId: new Types.ObjectId(bookingId) })
        .populate("userId", "username image")
        .exec();

      return rating;
    } catch (error) {
      console.error("Error fetching rating by booking ID:", error);
      throw error;
    }
  }

  async getRatingsByTechnicianId(technicianId: string): Promise<{
    data: IRating[];
    total: number;
    averageRating: number;
  }> {
    try {
      console.log("Fetching ratings for technician ID:", technicianId);

      const query = {
        technicianId: new Types.ObjectId(technicianId),
        ratingStatus: "Active",
      };

      const ratings = await this.model
        .find(query)
        .populate("userId", "username image")
        .sort({ createdAt: -1 })
        .exec();

      const averageRating =
        ratings.length > 0
          ? Number(
              (
                ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
              ).toFixed(1)
            )
          : 0;

      console.log(
        `Fetched ${ratings.length} ratings for technician. Average: ${averageRating}`
      );

      return {
        data: ratings,
        total: ratings.length,
        averageRating,
      };
    } catch (error) {
      console.error("Error fetching ratings by technician ID:", error);
      throw error;
    }
  }
}

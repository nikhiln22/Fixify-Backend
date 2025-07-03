import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IRating } from "../interfaces/Models/Irating";
import Rating from "../models/ratingModel";
import { IratingRepository } from "../interfaces/Irepositories/IratingRepository";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

@injectable()
export class RatingRepository
  extends BaseRepository<IRating>
  implements IratingRepository
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
        .populate("userId", "username email")
        .populate("serviceId", "name")
        .exec();

      return rating;
    } catch (error) {
      console.error("Error fetching rating by booking ID:", error);
      throw error;
    }
  }

  //   async getRatingsByTechnicianId(
  //     technicianId: string,
  //     options?: {
  //       page?: number;
  //       limit?: number;
  //     }
  //   ): Promise<{
  //     data: IRating[];
  //     total: number;
  //     averageRating: number;
  //   }> {
  //     try {
  //       console.log("Fetching ratings for technician ID:", technicianId);

  //       const page = options?.page || 1;
  //       const limit = options?.limit || 10;

  //       const query = { technicianId: new Types.ObjectId(technicianId) };

  //       const result = (await this.find(query, {
  //         pagination: { page, limit },
  //         sort: { createdAt: -1 },
  //         populate: [
  //           { path: "userId", select: "username" },
  //           { path: "serviceId", select: "name" },
  //         ],
  //       })) as { data: IRating[]; total: number };

  //       // Calculate average rating
  //       const allRatings = await this.model.find(query).select("rating").exec();

  //       const averageRating =
  //         allRatings.length > 0
  //           ? Number(
  //               (
  //                 allRatings.reduce((sum, r) => sum + r.rating, 0) /
  //                 allRatings.length
  //               ).toFixed(1)
  //             )
  //           : 0;

  //       console.log(
  //         `Fetched ${result.data.length} ratings for technician. Average: ${averageRating}`
  //       );

  //       return {
  //         data: result.data,
  //         total: result.total,
  //         averageRating,
  //       };
  //     } catch (error) {
  //       console.error("Error fetching ratings by technician ID:", error);
  //       throw error;
  //     }
  //   }

  //   async updateRating(
  //     filter: FilterQuery<IRating>,
  //     update: UpdateQuery<IRating>
  //   ): Promise<IRating | null> {
  //     return await this.updateOne(filter, update);
  //   }

  //   async deleteRating(ratingId: string): Promise<IRating | null> {
  //     return await this.deleteOne({ _id: ratingId });
  //   }
}

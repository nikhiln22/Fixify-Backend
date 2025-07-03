import { IRating } from "../Models/Irating";

export interface IratingRepository {
  createRating(data: {
    userId: string;
    technicianId: string;
    serviceId: string;
    bookingId: string;
    rating: number;
    review?: string;
  }): Promise<IRating>;

  getRatingByBookingId(bookingId: string): Promise<IRating | null>;

  //   getRatingsByTechnicianId(
  //     technicianId: string,
  //     options?: {
  //       page?: number;
  //       limit?: number;
  //     }
  //   ): Promise<{
  //     data: IRating[];
  //     total: number;
  //     averageRating: number;
  //   }>;

  //   updateRating(
  //     filter: FilterQuery<IRating>,
  //     update: UpdateQuery<IRating>
  //   ): Promise<IRating | null>;

  //   deleteRating(ratingId: string): Promise<IRating | null>;
}

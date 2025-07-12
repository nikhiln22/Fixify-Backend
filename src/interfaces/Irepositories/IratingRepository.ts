import { IRating } from "../Models/Irating";

export interface IRatingRepository {
  createRating(data: {
    userId: string;
    technicianId: string;
    serviceId: string;
    bookingId: string;
    rating: number;
    review?: string;
  }): Promise<IRating>;

  getRatingByBookingId(bookingId: string): Promise<IRating | null>;

  getRatingsByTechnicianId(technicianId: string): Promise<{
    data: IRating[];
    total: number;
    averageRating: number;
  }>;
}

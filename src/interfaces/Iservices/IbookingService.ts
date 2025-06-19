import {
  BookServiceResponse,
  CreateBookingRequest,
} from "../DTO/IServices/IuserService";
import { IBooking } from "../Models/Ibooking";

export interface IbookingService {
  bookService(
    userId: string,
    data: CreateBookingRequest
  ): Promise<BookServiceResponse>;
  verifyStripeSession(
    sessionId: string,
    userId: string
  ): Promise<BookServiceResponse>;
  getAllBookings(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      bookings: IBooking[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;
  getBookingById(
    bookingId: string,
    userId?: string
  ): Promise<BookServiceResponse>;
}

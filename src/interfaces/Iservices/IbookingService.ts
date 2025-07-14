import {
  BookServiceResponse,
  CreateBookingRequest,
} from "../DTO/IServices/IuserService";
import { IBooking } from "../Models/Ibooking";
import { IRating } from "../Models/Irating";

export interface IbookingService {
  bookService(
    userId: string,
    data: CreateBookingRequest
  ): Promise<BookServiceResponse>;
  verifyStripeSession(
    sessionId: string,
    userId: string
  ): Promise<BookServiceResponse>;
  getAllBookings(options: {
    page?: number;
    limit?: number;
    technicianId?: string;
    userId?: string;
    search?: string;
    filter?: string;
    role?: string;
  }): Promise<{
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
    options?: { userId?: string; technicianId?: string }
  ): Promise<BookServiceResponse>;
  generateCompletionOtp(
    technicianId: string,
    bookingId: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      otp: string;
    };
  }>;

  verifyCompletionOtp(
    technicianId: string,
    bookingId: string,
    otp: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
  }>;
  cancelBookingByUser(
    userId: string,
    bookingId: string,
    cancellationReason: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      booking: IBooking;
    };
  }>;
  cancelBookingByTechnician(
    techncianId: string,
    bookingId: string,
    cancellationReason: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      booking: IBooking;
    };
  }>;
  rateService(
    userId: string,
    bookingId: string,
    rating: number,
    review: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      booking: IBooking;
    };
  }>;

  getRating(
    bookingId: string,
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IRating | null;
  }>;
}

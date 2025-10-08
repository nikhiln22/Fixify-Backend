import { IBookingDetails } from "../DTO/IServices/IbookingService";
import {
  BookServiceResponse,
  CreateBookingRequest,
} from "../DTO/IServices/IuserService";
import { IBooking } from "../Models/Ibooking";
import { IRating } from "../Models/Irating";
import { IService } from "../Models/Iservice";

export interface IBookingService {
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
    message: string;
  }>;

  verifyCompletionOtp(
    technicianId: string,
    bookingId: string,
    otp: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { booking: IBookingDetails };
  }>;
  cancelBookingByUser(
    userId: string,
    bookingId: string,
    cancellationReason: string
  ): Promise<{
    success: boolean;
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
    message: string;
    data?: {
      booking: IBooking;
    };
  }>;

  getRating(bookingId: string): Promise<{
    success: boolean;
    message: string;
    data?: IRating | null;
  }>;

  getMostBookedServices(
    limit?: number,
    days?: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: IService[];
  }>;
  totalBookings(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getBookingStatusDistribution(): Promise<{
    success: boolean;
    message: string;
    data?: Array<{ status: string; count: number }>;
  }>;
  getRevenueTrends(days: number): Promise<{
    success: boolean;
    message: string;
    data?: Array<{ date: string; revenue: number }>;
  }>;
  getServiceCategoryPerformance(
    limit: number,
    days: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      categoryName: string;
      bookingCount: number;
      categoryId: string;
    }>;
  }>;
  startService(
    bookingId: string,
    technicianId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { bookingId: string; status: string };
  }>;
}

import { CreateBookingRequest } from "../DTO/IServices/IuserService";
import { IBooking } from "../Models/Ibooking";

export interface IbookingRepository {
  bookService(userId: string, data: CreateBookingRequest): Promise<IBooking>;
  getAllBookings(options: { page?: number; limit?: number }): Promise<{
    data: IBooking[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  findBookingById(bookingId: string): Promise<IBooking | null>;
  updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<IBooking | null>;
  cancelBooking(bookingId: string): Promise<IBooking | null>;
  getBookingDetailsById(
    bookingId: string,
    userId?: string
  ): Promise<IBooking | null>;
}

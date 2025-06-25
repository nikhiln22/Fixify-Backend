import { FilterQuery, UpdateQuery } from "mongoose";
import { CreateBookingRequest } from "../DTO/IServices/IuserService";
import { IBooking } from "../Models/Ibooking";

export interface IbookingRepository {
  bookService(userId: string, data: CreateBookingRequest): Promise<IBooking>;
  updateBooking(
    filter: FilterQuery<IBooking>,
    update: UpdateQuery<IBooking>
  ): Promise<IBooking | null>;
  getAllBookings(options: {
    page?: number;
    limit?: number;
    technicianId?: string;
  }): Promise<{
    data: IBooking[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  updateBookingStatus(
    bookingId: string,
    paymentStatus: string,
    bookingStatus: string
  ): Promise<IBooking | null>;
  cancelBooking(bookingId: string): Promise<IBooking | null>;
  getBookingDetailsById(
    bookingId: string,
    userId?: string,
    technicianId?: string
  ): Promise<IBooking | null>;
}

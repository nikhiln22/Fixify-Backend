import { FilterQuery, UpdateQuery } from "mongoose";
import { IBooking } from "../Models/Ibooking";

export interface IBookingRepository {
  bookService(
    userId: string,
    data: {
      technicianId: string;
      serviceId: string;
      addressId: string;
      timeSlotId: string[];
      bookingAmount: number;
      offerId?: string;
      couponId?: string;
      paymentMethod: "Online" | "Wallet";
      bookingStatus:
        | "Pending"
        | "Booked"
        | "In Progress"
        | "Cancelled"
        | "Completed";
    }
  ): Promise<IBooking>;
  updateBooking(
    filter: FilterQuery<IBooking>,
    update: UpdateQuery<IBooking>
  ): Promise<IBooking | null>;
  getAllBookings(options: {
    page?: number;
    limit?: number;
    technicianId?: string;
    userId?: string;
    search?: string;
    filter?: string;
    role?: string;
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
  getBookingDetailsById(
    bookingId: string,
    userId?: string,
    technicianId?: string
  ): Promise<IBooking | null>;
  getMostBookedServiceIds(
    limit?: number,
    days?: number
  ): Promise<
    Array<{
      serviceId: string;
      bookingCount: number;
    }>
  >;
  countUserBookings(userId: string): Promise<number>;
  totalBookings(): Promise<number>;
  getBookingStatusDistribution(): Promise<
    Array<{ status: string; count: number }>
  >;
  getServiceCategoryPerformance(
    limit: number,
    days: number
  ): Promise<
    Array<{ categoryName: string; bookingCount: number; categoryId: string }>
  >;
  getTechnicianTotalCompletedBookings(technicianId: string): Promise<number>;
  getTechnicianPendingJobs(technicianId: string): Promise<number>;
  getTechnicianBookingStatusDistribution(
    technicianId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      status: string;
      count: number;
    }>
  >;
  findBooking(
    userId: string,
    status: string,
    expiresAt: Date
  ): Promise<IBooking | null>;
  findExpiredPendingBookings(now: Date): Promise<IBooking[]>;
  deleteBookingById(BookingId: string): Promise<number>;
}

import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IBooking } from "../interfaces/Models/Ibooking";
import Booking from "../models/bookingModel";
import { CreateBookingRequest } from "../interfaces/DTO/IServices/IuserService";
import { IbookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IbookingRepository
{
  constructor() {
    super(Booking);
  }

  async bookService(
    userId: string,
    data: CreateBookingRequest
  ): Promise<IBooking> {
    try {
      console.log("Creating booking in repository with userId:", userId);
      console.log("Booking data:", data);

      const bookingData = {
        userId: new Types.ObjectId(userId),
        technicianId: new Types.ObjectId(data.technicianId),
        serviceId: new Types.ObjectId(data.serviceId),
        addressId: new Types.ObjectId(data.addressId),
        timeSlotId: data.timeSlotId,
        date: data.date,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        bookingStatus: "Pending" as const,
        paymentStatus: "Pending" as const,
        completed: false,
      };

      const newBooking = await this.create(bookingData);

      const populatedBooking = await this.model
        .findById(newBooking._id)
        .populate("serviceId", "name price description")
        .populate("technicianId", "username email phone")
        .populate("addressId", "fullAddress")
        .exec();

      return populatedBooking || newBooking;
    } catch (error) {
      console.error("Error in bookService repository:", error);
      throw error;
    }
  }

  async getAllBookings(options: { page?: number; limit?: number }): Promise<{
    data: IBooking[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the bookings");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IBooking> = {};

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IBooking[]; total: number };

      const populatedData = await Promise.all(
        result.data.map(async (booking) => {
          return await this.model
            .findById(booking._id)
            .populate("serviceId", "name price")
            .exec();
        })
      );

      console.log("data fetched from the booking repository:", {
        data: populatedData,
        total: result.total,
      });

      return {
        data: populatedData.filter(Boolean) as IBooking[],
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the bookings:", error);
      throw new Error("Failed to fetch the bookings");
    }
  }

  async getBookingDetailsById(
    bookingId: string,
    userId?: string
  ): Promise<IBooking | null> {
    try {
      console.log("Fetching booking details for ID:", bookingId);

      const filter: any = { _id: new Types.ObjectId(bookingId) };
      if (userId) {
        filter.userId = new Types.ObjectId(userId);
      }

      const booking = await this.model
        .findOne(filter)
        .populate("serviceId", "name price description")
        .populate("technicianId", "username email phone profilePicture")
        .populate("addressId", "fullAddress city state zipCode landmark")
        .populate("userId", "username email phone")
        .populate("timeSlotId", "date startTime endTime isBooked isAvailable")
        .exec();

      if (!booking) {
        console.log("Booking not found");
        return null;
      }

      console.log(
        "Booking details fetched successfully with populated timeSlot"
      );
      return booking;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }

  async findBookingById(bookingId: string): Promise<IBooking | null> {
    return await this.findById(bookingId);
  }

  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<IBooking | null> {
    return await this.updateOne(
      { _id: bookingId },
      { bookingStatus: status, completed: status === "completed" }
    );
  }

  async cancelBooking(bookingId: string): Promise<IBooking | null> {
    return await this.updateOne(
      { _id: bookingId },
      { bookingStatus: "cancelled", paymentStatus: "Failed" }
    );
  }
}

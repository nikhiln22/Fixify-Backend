import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IBooking } from "../interfaces/Models/Ibooking";
import Booking from "../models/bookingModel";
import { CreateBookingRequest } from "../interfaces/DTO/IServices/IuserService";
import { IbookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { FilterQuery, Types, UpdateQuery } from "mongoose";

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
        timeSlotId: new Types.ObjectId(data.timeSlotId),
        bookingAmount: data.bookingAmount,
        bookingStatus: data.bookingStatus,
      };

      const newBooking = await this.create(bookingData);

      return newBooking;
    } catch (error) {
      console.error("Error in bookService repository:", error);
      throw error;
    }
  }

  async getAllBookings(options: {
    page?: number;
    limit?: number;
    technicianId?: string;
  }): Promise<{
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
      const { technicianId } = options;

      const filter: FilterQuery<IBooking> = {};

      if (technicianId) {
        filter.technicianId = technicianId;
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
        populate: [
          { path: "serviceId", select: "name" },
          { path: "paymentId", select: "paymentStatus" },
          { path: "timeSlotId", select: "startTime date" },
        ],
      })) as { data: IBooking[]; total: number };

      console.log("data fetched from the booking repository:", {
        data: result,
        total: result.total,
      });

      return {
        data: result.data,
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
    userId?: string,
    technicianId?: string
  ): Promise<IBooking | null> {
    try {
      console.log("Fetching booking details for ID:", bookingId);
      console.log("userId in the booking respository:", userId);
      console.log("technicianId in the booking repository:", technicianId);

      const filter: any = { _id: new Types.ObjectId(bookingId) };
      if (userId) {
        filter.userId = new Types.ObjectId(userId);
      }

      if (technicianId) {
        filter.technicianId = new Types.ObjectId(technicianId);
      }

      const booking = await this.model
        .findOne(filter)
        .populate("serviceId", "name price description image")
        .populate("userId", "username email phone")
        .populate({
          path: "technicianId",
          select:
            "username email phone image is_verified yearsOfExperience Designation",
          populate: {
            path: "Designation",
            select: "designation",
          },
        })
        .populate("addressId", "fullAddress landmark addressType")
        .populate("timeSlotId", "date startTime endTime")
        .populate("paymentId", "paymentMethod paymentStatus amountPaid")
        .exec();

      if (!booking) {
        console.log("Booking not found");
        return null;
      }

      console.log(
        "Booking details fetched successfully with populated timeSlot:",
        booking
      );
      return booking;
    } catch (error) {
      console.error("Error fetching booking details:", error);
      throw error;
    }
  }

  async updateBooking(
    filter: FilterQuery<IBooking>,
    update: UpdateQuery<IBooking>
  ): Promise<IBooking | null> {
    return await this.updateOne(filter, update);
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

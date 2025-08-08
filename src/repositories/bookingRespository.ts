import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IBooking } from "../interfaces/Models/Ibooking";
import Booking from "../models/bookingModel";
import { CreateBookingRequest } from "../interfaces/DTO/IServices/IuserService";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import mongoose, { FilterQuery, Types, UpdateQuery } from "mongoose";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
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
  }> {
    try {
      console.log("entering the function which fetches all the bookings");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const { technicianId, userId, filter, role } = options;

      const query: FilterQuery<IBooking> = {};

      if (userId) {
        query.userId = userId;
      }

      if (technicianId) {
        query.technicianId = technicianId;
      }

      if (filter) {
        if (role === "admin") {
          if (filter === "Booked") {
            query.bookingStatus = "Booked";
          } else if (filter === "Cancelled") {
            query.bookingStatus = "Cancelled";
          } else if (filter === "Completed") {
            query.bookingStatus = "Completed";
          }
        } else if (role === "technician") {
          switch (filter) {
            case "today":
            case "upcoming":
              query.bookingStatus = "Booked";
              break;
            case "completed":
              query.bookingStatus = "Completed";
              break;
            case "cancelled":
              query.bookingStatus = "Cancelled";
              break;
            default:
              break;
          }
        } else if (role === "user") {
          switch (filter) {
            case "active":
              query.bookingStatus = "Booked";
              break;
            case "completed":
              query.bookingStatus = "Completed";
              break;
            case "cancelled":
              query.bookingStatus = "Cancelled";
              break;
            default:
              break;
          }
        }
      }

      const result = (await this.find(query, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
        populate: [
          { path: "serviceId", select: "name" },
          { path: "paymentId", select: "paymentStatus" },
          { path: "timeSlotId", select: "startTime endTime date" },
          { path: "technicianId", select: "username image" },
          { path: "userId", select: "username" },
        ],
      })) as { data: IBooking[]; total: number };

      if (filter && role === "technician") {
        if (filter === "today") {
          const today = new Date();
          const todayStr =
            today.getDate().toString().padStart(2, "0") +
            "-" +
            (today.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            today.getFullYear();

          console.log("todayStr:", todayStr);
          result.data = result.data.filter((booking) => {
            const timeSlot = booking.timeSlotId as ITimeSlot;
            return timeSlot && timeSlot.date === todayStr;
          });
          result.total = result.data.length;
        } else if (filter === "upcoming") {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr =
            tomorrow.getDate().toString().padStart(2, "0") +
            "-" +
            (tomorrow.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            tomorrow.getFullYear();

          console.log("tomorrowStr:", tomorrowStr);

          result.data = result.data.filter((booking) => {
            const timeSlot = booking.timeSlotId as ITimeSlot;
            return timeSlot && timeSlot.date && timeSlot.date >= tomorrowStr;
          });
          result.total = result.data.length;
        }
      }

      console.log(
        `data fetched from the booking repository for ${filter} bookings:`,
        {
          data: result,
          total: result.total,
        }
      );

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

      console.log("filter object in the booking repository:", filter);

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
        .populate(
          "paymentId",
          "paymentMethod paymentStatus amountPaid refundStatus refundDate refundAmount fixifyShare technicianShare technicianPaid technicianPaidAt"
        )
        .exec();

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

  async getMostBookedServiceIds(
    limit?: number,
    days?: number
  ): Promise<Array<{ serviceId: string; bookingCount: number }>> {
    try {
      console.log(
        "entering to the booking repository that fetches the most booked service Id's"
      );
      console.log(
        "limit in the get most booked ServiceIds in the booking repository:",
        limit
      );
      console.log(
        "days in the get most booked serviceIds in the booking repository:",
        days
      );

      const defaultLimit = limit || 6;
      const defaultDays = days || 30;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - defaultDays);

      console.log("Date filter from:", dateFrom);

      const result = (await this.model.aggregate([
        {
          $match: {
            bookingStatus: { $in: ["Completed", "Booked"] },
            createdAt: { $gte: dateFrom },
          },
        },
        {
          $group: {
            _id: "$serviceId",
            bookingCount: { $sum: 1 },
          },
        },
        {
          $sort: { bookingCount: -1 },
        },
        {
          $limit: defaultLimit,
        },
        {
          $project: {
            serviceId: { $toString: "$_id" },
            bookingCount: 1,
            _id: 0,
          },
        },
      ])) as Array<{ serviceId: string; bookingCount: number }>;

      console.log("Most booked service IDs result:", result);

      return result;
    } catch (error) {
      console.log("Error in getMostBookedServiceIds repository:", error);
      throw error;
    }
  }

  async countUserBookings(userId: string): Promise<number> {
    try {
      const filter: FilterQuery<IBooking> = {
        userId: new Types.ObjectId(userId),
        bookingStatus: { $ne: "Cancelled" },
      };

      const count = await this.countDocument(filter);
      return count;
    } catch (error) {
      console.log("Error counting non-cancelled bookings:", error);
      return 0;
    }
  }

  async totalBookings(): Promise<number> {
    try {
      console.log(
        "eneterd the function that fetches the total bookings in the technician repostory"
      );
      const totalBookings = await this.countDocument({});
      console.log("total bookings:", totalBookings);
      return totalBookings;
    } catch (error) {
      console.log("error occured while fetching the total bookings:", error);
      return 0;
    }
  }

  async getBookingStatusDistribution(): Promise<
    Array<{ status: string; count: number }>
  > {
    try {
      console.log("fetching booking status distribution from repository");

      const result = await this.model.aggregate([
        {
          $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      console.log("booking status distribution result:", result);
      return result;
    } catch (error) {
      console.log("error in getBookingStatusDistribution repository:", error);
      return [];
    }
  }

  async getServiceCategoryPerformance(
    limit: number = 10,
    days: number = 30
  ): Promise<
    Array<{ categoryName: string; bookingCount: number; categoryId: string }>
  > {
    try {
      console.log("fetching service category performance from repository");

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await this.model.aggregate([
        {
          $match: {
            bookingStatus: { $in: ["Completed", "Booked"] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "serviceDetails",
          },
        },
        {
          $unwind: "$serviceDetails",
        },
        {
          $lookup: {
            from: "categories",
            localField: "serviceDetails.category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },
        {
          $group: {
            _id: "$categoryDetails._id",
            categoryName: { $first: "$categoryDetails.name" },
            bookingCount: { $sum: 1 },
          },
        },
        {
          $project: {
            categoryId: { $toString: "$_id" },
            categoryName: 1,
            bookingCount: 1,
            _id: 0,
          },
        },
        {
          $sort: { bookingCount: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      console.log("service category performance result:", result);
      return result;
    } catch (error) {
      console.log("error in getServiceCategoryPerformance repository:", error);
      return [];
    }
  }

  async getTechnicianTotalCompletedBookings(
    technicianId: string
  ): Promise<number> {
    try {
      console.log(
        "entered the booking repository that fetches the total technician completed jobs"
      );
      const technicianCompletedBookings = await this.countDocument({
        technicianId: technicianId,
        bookingStatus: "Completed",
      });
      console.log(
        "total completed technician bookings:",
        technicianCompletedBookings
      );
      return technicianCompletedBookings;
    } catch (error) {
      console.log(
        "error occured while fetching the technician total completed bookings:",
        error
      );
      throw error;
    }
  }

  async getTechnicianPendingJobs(technicianId: string): Promise<number> {
    try {
      console.log(
        "enterd to the booking reposiotry that fetches the technician pending jobs:",
        technicianId
      );
      const techncianPendingJobs = await this.countDocument({
        technicianId: technicianId,
        bookingStatus: "Booked",
      });
      return techncianPendingJobs;
    } catch (error) {
      console.log(
        "error occured while fetching the technician pending jobs:",
        error
      );
      throw error;
    }
  }
  async getTechnicianBookingStatusDistribution(
    technicianId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      status: string;
      count: number;
    }>
  > {
    try {
      console.log(
        `Fetching booking status distribution for technician:`,
        technicianId
      );

      const matchConditions: FilterQuery<IBooking> = {
        technicianId: new mongoose.Types.ObjectId(technicianId),
      };

      // Add date range if provided
      if (startDate && endDate) {
        matchConditions.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const statusDistribution = await this.model.aggregate([
        {
          $match: matchConditions,
        },
        {
          $group: {
            _id: "$bookingStatus",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return statusDistribution;
    } catch (error) {
      console.log("Error fetching booking status distribution:", error);
      throw error;
    }
  }
}

import {
  CreateBookingRequest,
  BookServiceResponse,
  BookingsListResponse,
} from "../interfaces/DTO/IServices/IuserService";
import { IbookingService } from "../interfaces/Iservices/IbookingService";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { IbookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IBooking } from "../interfaces/Models/Ibooking";

@injectable()
export class BookingService implements IbookingService {
  constructor(
    @inject("IbookingRepository") private bookingRepository: IbookingRepository,
    @inject("ITimeSlotService") private timeSlotService: ITimeSlotService
  ) {}

  async bookService(
    userId: string,
    data: CreateBookingRequest
  ): Promise<BookServiceResponse> {
    try {
      console.log("entered to the service which books the service:");
      console.log("data in the bookservice service:", data);

      if (!userId) {
        return {
          success: false,
          message: "User ID is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.technicianId) {
        return {
          success: false,
          message: "Technician ID is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.serviceId) {
        return {
          success: false,
          message: "Service ID is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.addressId) {
        return {
          success: false,
          message: "Address ID is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.timeSlotId) {
        return {
          success: false,
          message: "Time slot ID is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.date) {
        return {
          success: false,
          message: "Date is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.totalAmount) {
        return {
          success: false,
          message: "Total amount is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (!data.paymentMethod) {
        return {
          success: false,
          message: "Payment method is required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      if (data.totalAmount <= 0) {
        return {
          success: false,
          message: "Total amount must be greater than 0",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      console.log("entered to the service which books the service:");
      console.log("data in the bookservice service:", data);

      const slotBooking = await this.timeSlotService.updateSlotBookingStatus(
        data.technicianId,
        data.timeSlotId,
        true
      );

      if (!slotBooking.success) {
        return {
          success: false,
          message: slotBooking.message,
          status: slotBooking.status,
        };
      }

      const newBooking = await this.bookingRepository.bookService(userId, data);

      console.log("Booking created successfully:", newBooking);

      return {
        success: true,
        message: "Booking created successfully",
        data: newBooking,
        status: HTTP_STATUS.CREATED,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create booking",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<BookServiceResponse> {
    try {
      const updatedBooking = await this.bookingRepository.updateBookingStatus(
        bookingId,
        status
      );

      if (!updatedBooking) {
        return {
          success: false,
          message: "Booking not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      return {
        success: true,
        message: "Booking status updated successfully",
        data: updatedBooking,
        status: HTTP_STATUS.OK,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to update booking status",
        error: error.message,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllBookings(options: { page?: number; limit?: number }): Promise<{
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
  }> {
    try {
      console.log("Function fetching all the Bookings");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.bookingRepository.getAllBookings({
        page,
        limit,
      });

      console.log("result from the user service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Users fetched successfully",
        data: {
          bookings: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching users",
      };
    }
  }

  async getBookingById(bookingId: string, userId?: string): Promise<BookServiceResponse> {
    try {
      console.log("BookingService: Getting booking details for ID:", bookingId);

      if (!bookingId || bookingId.length !== 24) {
        return {
          success: false,
          message: "Invalid booking ID format",
          status: HTTP_STATUS.BAD_REQUEST
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(bookingId, userId);

      if (!booking) {
        return {
          success: false,
          message: "Booking not found or you don't have permission to view this booking",
          status: HTTP_STATUS.NOT_FOUND
        };
      }

      return {
        success: true,
        message: "Booking details retrieved successfully",
        data: booking,
        status: HTTP_STATUS.OK
      };
    } catch (error: any) {
      console.error("Error in getBookingById service:", error);
      return {
        success: false,
        message: "Failed to retrieve booking details",
        error: error.message,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}

import {
  CreateBookingRequest,
  BookServiceResponse,
} from "../interfaces/DTO/IServices/IuserService";
import { IbookingService } from "../interfaces/Iservices/IbookingService";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { IbookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IBooking } from "../interfaces/Models/Ibooking";
import { stripe } from "../config/stripeConfig";
import config from "../config/env";

@injectable()
export class BookingService implements IbookingService {
  constructor(
    @inject("IbookingRepository") private bookingRepository: IbookingRepository,
    @inject("ITimeSlotService") private timeSlotService: ITimeSlotService,
    @inject("IWalletRepository") private walletRepository: IWalletRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository
  ) {}

  async bookService(
    userId: string,
    data: CreateBookingRequest
  ): Promise<BookServiceResponse> {
    try {
      console.log("entered to the service which books the service");
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

      if (!data.bookingAmount) {
        return {
          success: false,
          message: "Booking amount is required",
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

      if (!["Online", "Wallet"].includes(data.paymentMethod)) {
        return {
          success: false,
          message: "Payment method must be either 'Online' or 'Wallet'",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

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

      if (data.paymentMethod === "Wallet") {
        try {
          const userWallet = await this.walletRepository.getWalletByUserId(
            userId
          );
          console.log(
            "fetched user wallet in the booking by payment:",
            userWallet
          );

          if (!userWallet) {
            await this.timeSlotService.updateSlotBookingStatus(
              data.technicianId,
              data.timeSlotId,
              false
            );
            return {
              success: false,
              message: "Wallet not found for the user",
              status: HTTP_STATUS.NOT_FOUND,
            };
          }

          if (userWallet.balance < data.bookingAmount) {
            await this.timeSlotService.updateSlotBookingStatus(
              data.technicianId,
              data.timeSlotId,
              false
            );
            return {
              success: false,
              message: "Insufficient wallet balance",
              status: HTTP_STATUS.BAD_REQUEST,
            };
          }

          const bookingData = {
            ...data,
            bookingStatus: "Booked" as const,
          };

          const newBooking = await this.bookingRepository.bookService(
            userId,
            bookingData
          );

          console.log("Booking created successfully:", newBooking);

          let newBookingId = newBooking._id.toString().slice(-8);

          const walletUpdate =
            await this.walletRepository.updateWalletBalanceWithTransaction(
              userId,
              data.bookingAmount,
              "Debit",
              `Payment for service booking #${newBookingId}`,
              newBooking._id.toString()
            );

          if (!walletUpdate.wallet || !walletUpdate.transaction) {
            throw new Error("Failed to process wallet payment");
          }

          const fixifySharePercentage = 0.2;
          const fixifyShare = parseFloat(
            (data.bookingAmount * fixifySharePercentage).toFixed(2)
          );
          const technicianShare = parseFloat(
            (data.bookingAmount - fixifyShare).toFixed(2)
          );

          let newPayment = await this.paymentRepository.createPayment({
            userId: userId,
            bookingId: newBooking._id.toString(),
            technicianId: data.technicianId,
            amountPaid: data.bookingAmount,
            fixifyShare: fixifyShare,
            technicianShare: technicianShare,
            paymentMethod: "Wallet",
            paymentStatus: "Paid",
            technicianPaid: false,
            refundStatus: "Not Refunded",
          });

          await this.bookingRepository.updateBooking(
            { _id: newBooking._id },
            { paymentId: newPayment._id }
          );

          return {
            success: true,
            message:
              "Booking created and payment completed successfully using wallet",
            data: {
              ...newBooking.toObject(),
              paymentMethod: data.paymentMethod,
              requiresPayment: false,
              paymentCompleted: true,
            },
            status: HTTP_STATUS.CREATED,
          };
        } catch (walletError) {
          console.error("Wallet payment failed:", walletError);

          await this.timeSlotService.updateSlotBookingStatus(
            data.technicianId,
            data.timeSlotId,
            false
          );

          return {
            success: false,
            message: "Wallet payment failed. Please try again.",
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          };
        }
      }

      const bookingData = {
        ...data,
        bookingStatus: "Pending" as const,
      };

      const newBooking = await this.bookingRepository.bookService(
        userId,
        bookingData
      );
      console.log("Booking created successfully:", newBooking);

      try {
        const amountInCents = Math.round(data.bookingAmount * 100);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: "Fixify Service Booking",
                  description: "Booking for service with technician",
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            bookingId: newBooking._id.toString(),
            userId: userId,
            serviceId: data.serviceId,
            technicianId: data.technicianId,
          },
          success_url: `${config.CLIENT_URL}/user/bookingsuccess?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${config.CLIENT_URL}/user/payment-cancelled`,
        });

        console.log("Session:", session);

        return {
          success: true,
          message: "Booking created successfully. Complete payment to confirm.",
          data: {
            ...newBooking.toObject(),
            paymentMethod: data.paymentMethod,
            checkoutUrl: session.url,
            requiresPayment: true,
          },
          status: HTTP_STATUS.CREATED,
        };
      } catch (paymentError) {
        console.error("Payment intent creation failed:", paymentError);

        await this.timeSlotService.updateSlotBookingStatus(
          data.technicianId,
          data.timeSlotId,
          false
        );

        return {
          success: false,
          message: "Failed to create payment intent. Please try again.",
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }
    } catch (error) {
      console.error("Error in bookService:", error);
      return {
        success: false,
        message: "Failed to create booking",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async verifyStripeSession(
    sessionId: string,
    userId: string
  ): Promise<BookServiceResponse> {
    try {
      console.log(
        "entering to the booking service that verifies stripe session"
      );
      console.log("sessionId in the booking service:", sessionId);
      console.log("userId in the booking service:", userId);

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed or session not found",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const bookingId = session.metadata?.bookingId;

      console.log("bookingId in the booking service:", bookingId);

      if (!bookingId) {
        return {
          success: false,
          message: "Invalid or missing booking ID in session metadata",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId
      );

      console.log(
        "booking details in the stripe verifying function in the booking service:",
        booking
      );

      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const existingPayment = await this.paymentRepository.findByBookingId(
        bookingId
      );

      if (existingPayment) {
        return {
          success: true,
          message: "Payment already verified",
          data: {
            ...booking.toObject(),
            paymentMethod: "Online",
            paymentCompleted: true,
          },
          status: HTTP_STATUS.OK,
        };
      }

      const updatedBooking = await this.bookingRepository.updateBooking(
        { _id: bookingId },
        { bookingStatus: "Booked" }
      );

      console.log("updatedBooking in the booking service:", updatedBooking);

      if (!updatedBooking) {
        return {
          success: false,
          message: "Failed to update booking status",
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }

      const fixifySharePercentage = 0.2;
      const fixifyShare = parseFloat(
        (booking.bookingAmount * fixifySharePercentage).toFixed(2)
      );
      const technicianShare = parseFloat(
        (booking.bookingAmount - fixifyShare).toFixed(2)
      );

      let newPayment = await this.paymentRepository.createPayment({
        userId: userId,
        bookingId: bookingId,
        technicianId: booking.technicianId._id.toString(),
        amountPaid: booking.bookingAmount,
        fixifyShare: fixifyShare,
        technicianShare: technicianShare,
        paymentMethod: "Online",
        paymentStatus: "Paid",
        technicianPaid: false,
        refundStatus: "Not Refunded",
      });

      await this.bookingRepository.updateBooking(
        { _id: bookingId },
        { paymentId: newPayment._id }
      );

      return {
        success: true,
        message: "Payment verified and booking completed",
        data: {
          ...updatedBooking.toObject(),
          paymentMethod: "Online",
          paymentCompleted: true,
        },
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log(
        "error occurred while verifying the session in the booking service:",
        error
      );
      return {
        success: false,
        message: "Internal server error",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllBookings(options: {
    page?: number;
    limit?: number;
    technicianId?: string;
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
  }> {
    try {
      console.log("Function fetching all the Bookings");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const { technicianId } = options;

      const result = await this.bookingRepository.getAllBookings({
        page,
        limit,
        technicianId,
      });

      console.log("result from the booking service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: technicianId
          ? "Technician bookings fetched successfully"
          : "Bookings fetched successfully",
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
      console.error("Error fetching bookings:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching bookings",
      };
    }
  }

  async getBookingById(
    bookingId: string,
    userId?: string
  ): Promise<BookServiceResponse> {
    try {
      console.log("BookingService: Getting booking details for ID:", bookingId);

      if (!bookingId || bookingId.length !== 24) {
        return {
          success: false,
          message: "Invalid booking ID format",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId,
        userId
      );

      if (!booking) {
        return {
          success: false,
          message:
            "Booking not found or you don't have permission to view this booking",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      return {
        success: true,
        message: "Booking details retrieved successfully",
        data: booking,
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.error("Error in getBookingById service:", error);
      return {
        success: false,
        message: "Failed to retrieve booking details",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

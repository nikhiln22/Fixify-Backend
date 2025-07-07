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
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IredisService } from "../interfaces/Iredis/Iredis";
import {
  OtpPurpose,
  BOOKING_OTP_EXPIRATION_SECONDS,
  OTP_PREFIX,
} from "../config/otpConfig";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { EmailType, APP_NAME } from "../config/emailConfig";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";
import { IRatingRepository } from "../interfaces/Irepositories/IratingRepository";

@injectable()
export class BookingService implements IbookingService {
  constructor(
    @inject("IbookingRepository") private bookingRepository: IbookingRepository,
    @inject("ITimeSlotService") private timeSlotService: ITimeSlotService,
    @inject("IWalletRepository") private walletRepository: IWalletRepository,
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("IOTPService") private otpService: IOTPService,
    @inject("IredisService") private redisService: IredisService,
    @inject("IemailService") private emailService: IemailService,
    @inject("IRatingRepository") private ratingRepository: IRatingRepository
  ) {}

  private getOtpRedisKey(email: string, purpose: OtpPurpose): string {
    return `${OTP_PREFIX}${purpose}:${email}`;
  }

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this.otpService.generateOtp();
    console.log(`Generated Otp for ${purpose}:`, otp);

    const redisKey = this.getOtpRedisKey(email, purpose);

    console.log("generated RedisKey:", redisKey);

    await this.redisService.set(redisKey, otp, BOOKING_OTP_EXPIRATION_SECONDS);

    if (purpose === OtpPurpose.PASSWORD_RESET) {
      await this.emailService.sendPasswordResetEmail(email, otp);
    } else {
      await this.emailService.sendOtpEmail(email, otp);
    }
    return otp;
  }

  private async verifyOtpGeneric(
    key: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
  }> {
    const redisKey = this.getOtpRedisKey(key, purpose);
    const storedOtp = await this.redisService.get(redisKey);

    if (!storedOtp) {
      return {
        success: false,
        message: "OTP has expired or doesn't exist. Please request a new one",
        status: HTTP_STATUS.BAD_REQUEST,
      };
    }

    if (storedOtp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    return {
      success: true,
      message: "OTP verified successfully",
      status: HTTP_STATUS.OK,
    };
  }

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
          const userWallet = await this.walletRepository.getWalletByOwnerId(
            userId,
            "user"
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
              "user",
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
  }> {
    try {
      console.log("Function fetching all the Bookings");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const search = options.search;
      const filter = options.filter;
      const role = options.role || "admin";
      const { technicianId, userId } = options;

      const result = await this.bookingRepository.getAllBookings({
        page,
        limit,
        technicianId,
        userId,
        search,
        filter,
        role,
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
    options?: { userId?: string; technicianId?: string }
  ): Promise<BookServiceResponse> {
    try {
      console.log(
        "BookingService: Getting booking details for bookingId:",
        bookingId
      );
      console.log("BookingService: Options:", options);

      if (!bookingId || bookingId.length !== 24) {
        return {
          success: false,
          message: "Invalid booking ID format",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const { userId, technicianId } = options || {};

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId,
        userId,
        technicianId
      );

      console.log(
        "fetched booking details from the booking repository:",
        booking
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

  async generateCompletionOtp(
    technicianId: string,
    bookingId: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: { otp: string };
  }> {
    try {
      console.log(
        "entering the booking service function which generates the completion otp"
      );
      console.log("technicianId in the booking service:", technicianId);
      console.log("bookingId in the booking service:", bookingId);

      if (!technicianId || !bookingId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Technician ID and Booking ID are required",
        };
      }

      const booking = (await this.bookingRepository.getBookingDetailsById(
        bookingId
      )) as any;

      console.log("fetched booking:", booking);

      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message: "You are not authorized to complete this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Cannot complete booking with status: ${booking.bookingStatus}`,
        };
      }

      const existingOtpKey = this.getOtpRedisKey(
        bookingId,
        OtpPurpose.BOOKING_COMPLETION
      );
      const existingOtp = await this.redisService.get(existingOtpKey);

      if (existingOtp) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "OTP already sent. Please wait before requesting a new one.",
        };
      }

      const otp = await this.otpService.generateOtp();
      console.log(`Generated completion OTP for booking ${bookingId}:`, otp);

      const redisKey = this.getOtpRedisKey(
        bookingId,
        OtpPurpose.BOOKING_COMPLETION
      );
      await this.redisService.set(
        redisKey,
        otp,
        BOOKING_OTP_EXPIRATION_SECONDS
      );

      console.log("OTP stored in Redis with key:", redisKey);

      const emailData = {
        customerName:
          booking.userId?.username || booking.userId?.name || "Customer",
        serviceName: booking.serviceId?.name || "Service",
        technicianName:
          booking.technicianId?.username ||
          booking.technicianId?.name ||
          "Technician",
        otp: otp,
        bookingId: bookingId,
      };

      const emailContent = this.emailService.generateEmailContent(
        EmailType.BOOKING_COMPLETION_OTP,
        emailData
      );

      await this.emailService.sendEmail({
        to: booking.userId.email,
        subject: `Service Completion Verification - ${APP_NAME}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(
        "Completion OTP email sent to customer:",
        booking.userId.email
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Completion OTP generated and sent to customer successfully",
        data: { otp },
      };
    } catch (error) {
      console.error("Error in generateCompletionOtp:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to generate completion OTP",
      };
    }
  }

  async verifyCompletionOtp(
    technicianId: string,
    bookingId: string,
    otp: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
  }> {
    try {
      console.log("BookingService: Verifying completion OTP");
      console.log("technicianId:", technicianId);
      console.log("bookingId:", bookingId);
      console.log("provided OTP:", otp);

      if (!technicianId || !bookingId || !otp) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Technician ID, Booking ID, and OTP are required",
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId
      );

      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message: "You are not authorized to complete this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Cannot complete booking with status: ${booking.bookingStatus}`,
        };
      }

      const otpVerification = await this.verifyOtpGeneric(
        bookingId,
        otp,
        OtpPurpose.BOOKING_COMPLETION
      );

      if (!otpVerification.success) {
        return otpVerification;
      }

      const updatedBooking = await this.bookingRepository.updateBooking(
        { _id: bookingId },
        { bookingStatus: "Completed" }
      );

      if (!updatedBooking) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update booking status",
        };
      }

      try {
        const payment = await this.paymentRepository.findByBookingId(bookingId);
        console.log("found payment in booking repository:", payment);

        if (payment && !payment.technicianPaid) {
          let technicianWallet = await this.walletRepository.getWalletByOwnerId(
            technicianId,
            "technician"
          );

          if (!technicianWallet) {
            console.log("Technician wallet not found, creating new wallet");
            technicianWallet = await this.walletRepository.createWallet(
              technicianId,
              "technician"
            );
            console.log("Created new wallet for technician:", technicianWallet);
          }

          await this.walletRepository.updateWalletBalanceWithTransaction(
            technicianId,
            "technician",
            payment.technicianShare,
            "Credit",
            `Payment for completed service - Booking #${bookingId.slice(-8)}`,
            bookingId
          );

          await this.paymentRepository.updatePayment(payment._id.toString(), {
            technicianPaid: true,
            technicianPaidAt: new Date(),
          });

          console.log(
            `Technician paid ₹${payment.technicianShare} for booking ${bookingId}`
          );
        }
      } catch (paymentError) {
        console.error("Error paying technician:", paymentError);
      }

      const redisKey = this.getOtpRedisKey(
        bookingId,
        OtpPurpose.BOOKING_COMPLETION
      );
      await this.redisService.delete(redisKey);

      console.log(
        `Booking ${bookingId} completed successfully by technician ${technicianId}`
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Service completed successfully",
      };
    } catch (error) {
      console.error("Error in verifyCompletionOtp:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to verify completion OTP",
      };
    }
  }

  async cancelBookingByUser(
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
  }> {
    try {
      console.log("BookingService: User cancelling booking");
      console.log("userId:", userId);
      console.log("bookingId:", bookingId);
      console.log("cancellationReason:", cancellationReason);

      if (!userId || !bookingId || !cancellationReason) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "User ID, Booking ID, and cancellation reason are required",
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId
      );
      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Booking not found",
        };
      }

      if (booking.userId._id.toString() !== userId) {
        return {
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message: "You are not authorized to cancel this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Cannot cancel booking with status: ${booking.bookingStatus}`,
        };
      }

      const timeSlot = booking.timeSlotId as ITimeSlot;
      if (!timeSlot || !timeSlot.date || !timeSlot.startTime) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Booking time slot information not found",
        };
      }

      const dateStr = timeSlot.date;
      const timeStr = timeSlot.startTime;
      const [day, month, year] = dateStr.split("-");
      const jsDateStr = `${month}/${day}/${year} ${timeStr}`;
      const scheduledDate = new Date(jsDateStr);
      const now = new Date();
      const hoursUntilService =
        (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let refundPercentage = 0;
      if (hoursUntilService >= 6) {
        refundPercentage = 100;
      } else if (hoursUntilService >= 2) {
        refundPercentage = 50;
      }

      const refundAmount = (booking.bookingAmount * refundPercentage) / 100;

      console.log("Cancellation details:", {
        scheduledDate: scheduledDate.toISOString(),
        hoursUntilService,
        refundPercentage,
        refundAmount,
      });

      const payment = await this.paymentRepository.findByBookingId(bookingId);
      if (!payment) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Payment record not found",
        };
      }

      const updatedBooking = await this.bookingRepository.updateBooking(
        { _id: bookingId },
        {
          bookingStatus: "Cancelled",
          cancellationReason: cancellationReason,
          cancelledBy: "user",
          cancellationDate: new Date(),
        }
      );

      if (!updatedBooking) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update booking status",
        };
      }

      await this.paymentRepository.updatePayment(payment._id.toString(), {
        paymentStatus: refundAmount > 0 ? "Refunded" : "Paid",
        refundStatus: refundAmount > 0 ? "Refunded" : "Not Refunded",
        refundAmount: refundAmount,
        refundDate: refundAmount > 0 ? new Date() : undefined,
      });

      if (refundAmount > 0) {
        let userWallet = await this.walletRepository.getWalletByOwnerId(
          userId,
          "user"
        );
        if (!userWallet) {
          console.log("User wallet not found, creating new wallet");
          userWallet = await this.walletRepository.createWallet(userId, "user");
        }

        await this.walletRepository.updateWalletBalanceWithTransaction(
          userId,
          "user",
          refundAmount,
          "Credit",
          `Refund for cancelled booking #${bookingId
            .slice(-8)
            .toUpperCase()} (${refundPercentage}% refund)`,
          bookingId
        );

        console.log(
          `Refunded ₹${refundAmount} to user ${userId} for booking ${bookingId}`
        );
      }

      try {
        const timeSlot = booking.timeSlotId as ITimeSlot;
        await this.timeSlotService.updateSlotBookingStatus(
          booking.technicianId._id.toString(),
          timeSlot._id.toString(),
          false
        );
        console.log("Time slot freed up successfully");
      } catch (slotError) {
        console.error("Error freeing up time slot:", slotError);
      }

      console.log(
        `Booking ${bookingId} cancelled successfully by user ${userId}`
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message:
          refundAmount > 0
            ? `Booking cancelled successfully. ₹${refundAmount} refunded to your wallet.`
            : "Booking cancelled successfully. No refund applicable.",
        data: {
          booking: updatedBooking,
        },
      };
    } catch (error) {
      console.error("Error in cancelBookingByUser:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to cancel booking",
      };
    }
  }

  async cancelBookingByTechnician(
    technicianId: string,
    bookingId: string,
    cancellationReason: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: { booking: IBooking };
  }> {
    try {
      console.log("BookingService: Technician cancelling booking");
      console.log("technicianId:", technicianId);
      console.log("bookingId:", bookingId);
      console.log("cancellationReason:", cancellationReason);

      if (!technicianId || !bookingId || !cancellationReason) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message:
            "Technician ID, Booking ID, and cancellation reason are required",
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId
      );
      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message: "You are not authorized to cancel this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Cannot cancel booking with status: ${booking.bookingStatus}`,
        };
      }

      const timeSlot = booking.timeSlotId as ITimeSlot;
      if (!timeSlot || !timeSlot.date || !timeSlot.startTime) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Booking time slot information not found",
        };
      }

      const dateStr = timeSlot.date;
      const timeStr = timeSlot.startTime;
      const [day, month, year] = dateStr.split("-");
      const jsDateStr = `${month}/${day}/${year} ${timeStr}`;
      const scheduledDate = new Date(jsDateStr);
      const now = new Date();
      const hoursUntilService =
        (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(scheduledDate);
      bookingDate.setHours(0, 0, 0, 0);
      const isToday = today.getTime() === bookingDate.getTime();

      if (isToday) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Cannot cancel bookings scheduled for today",
        };
      }

      if (hoursUntilService < 2) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Cannot cancel bookings with less than 2 hours notice",
        };
      }

      console.log("Technician cancellation validation passed:", {
        scheduledDate: scheduledDate.toISOString(),
        hoursUntilService,
        isToday,
      });

      const payment = await this.paymentRepository.findByBookingId(bookingId);
      if (!payment) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Payment record not found",
        };
      }

      const updatedBooking = await this.bookingRepository.updateBooking(
        { _id: bookingId },
        {
          bookingStatus: "Cancelled",
          cancellationReason: cancellationReason,
          cancelledBy: "technician",
          cancellationDate: new Date(),
        }
      );

      if (!updatedBooking) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update booking status",
        };
      }

      const fullRefundAmount = booking.bookingAmount;

      await this.paymentRepository.updatePayment(payment._id.toString(), {
        paymentStatus: "Refunded",
        refundStatus: "Refunded",
        refundAmount: fullRefundAmount,
        refundDate: new Date(),
      });

      let userWallet = await this.walletRepository.getWalletByOwnerId(
        booking.userId._id.toString(),
        "user"
      );

      if (!userWallet) {
        console.log("User wallet not found, creating new wallet");
        userWallet = await this.walletRepository.createWallet(
          booking.userId._id.toString(),
          "user"
        );
      }

      await this.walletRepository.updateWalletBalanceWithTransaction(
        booking.userId._id.toString(),
        "user",
        fullRefundAmount,
        "Credit",
        `Full refund for technician cancelled booking #${bookingId
          .slice(-8)
          .toUpperCase()}`,
        bookingId
      );

      console.log(
        `Full refund of ₹${fullRefundAmount} processed to user ${booking.userId._id} for technician cancellation`
      );

      try {
        await this.timeSlotService.updateSlotBookingStatus(
          technicianId,
          timeSlot._id.toString(),
          false
        );
        console.log("Time slot freed up successfully");
      } catch (slotError) {
        console.error("Error freeing up time slot:", slotError);
      }

      console.log(
        `Booking ${bookingId} cancelled successfully by technician ${technicianId}`
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: `Booking cancelled successfully. Customer will receive a full refund of ₹${fullRefundAmount}.`,
        data: {
          booking: updatedBooking,
        },
      };
    } catch (error) {
      console.error("Error in cancelBookingByTechnician:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to cancel booking",
      };
    }
  }

  async rateService(
    userId: string,
    bookingId: string,
    rating: number,
    review: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: { booking: IBooking };
  }> {
    try {
      console.log(
        "entering the service function that rates the technician service"
      );
      console.log("userId:", userId);
      console.log("bookingId:", bookingId);
      console.log("rating:", rating);
      console.log("review:", review);

      if (!userId || !bookingId || rating === undefined || rating === null) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "User ID, Booking ID, and rating are required",
        };
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Rating must be an integer between 1 and 5",
        };
      }

      if (review && review.trim().length > 500) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Review cannot exceed 500 characters",
        };
      }

      const booking = await this.bookingRepository.getBookingDetailsById(
        bookingId,
        userId
      );

      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message:
            "Booking not found or you don't have permission to rate this service",
        };
      }

      if (booking.bookingStatus !== "Completed") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "You can only rate completed services",
        };
      }

      if (booking.isRated) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "This service has already been rated",
        };
      }

      const existingRating = await this.ratingRepository.getRatingByBookingId(
        bookingId
      );
      if (existingRating) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Rating already exists for this booking",
        };
      }

      const newRating = await this.ratingRepository.createRating({
        userId,
        technicianId: booking.technicianId._id.toString(),
        serviceId: booking.serviceId._id.toString(),
        bookingId,
        rating,
        review,
      });

      console.log("newley created rating for the service:", newRating);

      const updatedBooking = await this.bookingRepository.updateBooking(
        { _id: bookingId },
        { isRated: true }
      );

      if (!updatedBooking) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update booking status after rating",
        };
      }

      console.log(
        `Service rated successfully - Booking: ${bookingId}, Rating: ${rating}/5`
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Service rated successfully",
        data: {
          booking: updatedBooking,
        },
      };
    } catch (error) {
      console.error("Error in rateService:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to rate service",
      };
    }
  }
}

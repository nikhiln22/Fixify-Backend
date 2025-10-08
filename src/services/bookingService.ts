import {
  CreateBookingRequest,
  BookServiceResponse,
} from "../interfaces/DTO/IServices/IuserService";
import { IBookingService } from "../interfaces/Iservices/IbookingService";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IBooking } from "../interfaces/Models/Ibooking";
import { stripe } from "../config/stripeConfig";
import config from "../config/env";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IRedisService } from "../interfaces/Iredis/Iredis";
import {
  OtpPurpose,
  BOOKING_OTP_EXPIRATION_SECONDS,
  OTP_PREFIX,
} from "../config/otpConfig";
import { IEmailService } from "../interfaces/Iemail/Iemail";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";
import { IRatingRepository } from "../interfaces/Irepositories/IratingRepository";
import { IRating } from "../interfaces/Models/Irating";
import { IServiceRepository } from "../interfaces/Irepositories/IserviceRepository";
import { IService } from "../interfaces/Models/Iservice";
import { ICouponRepository } from "../interfaces/Irepositories/IcouponRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { IBookingDetails } from "../interfaces/DTO/IServices/IbookingService";
import { CreatePaymentData } from "../interfaces/DTO/IRepository/IpayementRepository";
import { PaymentMethod } from "../config/paymentMethod";
import Stripe from "stripe";
import { Types } from "mongoose";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject("IBookingRepository")
    private _bookingRepository: IBookingRepository,
    @inject("ITimeSlotService") private _timeSlotService: ITimeSlotService,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IRedisService") private _redisService: IRedisService,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IRatingRepository") private _ratingRepository: IRatingRepository,
    @inject("IServiceRepository")
    private _serviceRepository: IServiceRepository,
    @inject("ICouponRepository") private _couponRepository: ICouponRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository,
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository
  ) {}

  private getOtpRedisKey(email: string, purpose: OtpPurpose): string {
    return `${OTP_PREFIX}${purpose}:${email}`;
  }

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this._otpService.generateOtp();
    console.log(`Generated Otp for ${purpose}:`, otp);

    const redisKey = this.getOtpRedisKey(email, purpose);

    console.log("generated RedisKey:", redisKey);

    await this._redisService.set(redisKey, otp, BOOKING_OTP_EXPIRATION_SECONDS);

    if (purpose === OtpPurpose.PASSWORD_RESET) {
      await this._emailService.sendPasswordResetEmail(email, otp);
    } else {
      await this._emailService.sendOtpEmail(email, otp);
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
    const storedOtp = await this._redisService.get(redisKey);

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
      if (!userId) return { success: false, message: "User ID is required" };
      if (!data.technicianId)
        return { success: false, message: "Technician ID is required" };
      if (!data.serviceId)
        return { success: false, message: "Service ID is required" };
      if (!data.addressId)
        return { success: false, message: "Address ID is required" };
      if (!data.timeSlotId)
        return { success: false, message: "Time slot ID is required" };
      if (!data.bookingAmount)
        return { success: false, message: "Booking amount is required" };
      if (!data.paymentMethod)
        return { success: false, message: "Payment method is required" };

      if (
        !Object.values(PaymentMethod).includes(
          data.paymentMethod as PaymentMethod
        )
      ) {
        return {
          success: false,
          message: `Payment method must be ONLINE or WALLET`,
        };
      }

      const service = await this._serviceRepository.findServiceById(
        data.serviceId
      );
      if (!service) return { success: false, message: "Service not found" };

      let bookingDuration: number = 60;
      if (service.serviceType === "fixed" && service.estimatedTime)
        bookingDuration = service.estimatedTime;
      else if (service.serviceType === "hourly" && service.maxHours)
        bookingDuration = service.maxHours * 60;

      const existingBooking = await this._bookingRepository.findBooking(
        userId,
        "Pending" as const,
        new Date()
      );

      let bookingToUse: IBooking;

      if (existingBooking) {
        bookingToUse = existingBooking;
      } else {
        const slotReservation = await this._timeSlotService.reserveTimeSlot(
          data.technicianId,
          data.timeSlotId,
          userId,
          bookingDuration
        );

        if (!slotReservation.success) {
          return {
            success: false,
            message:
              slotReservation.message ||
              "The selected time slot is not available. Please choose another.",
          };
        }

        const bookingData = {
          technicianId: data.technicianId,
          serviceId: data.serviceId,
          addressId: data.addressId,
          timeSlotId: slotReservation.reservedSlots || [data.timeSlotId],
          bookingAmount: data.bookingAmount,
          paymentMethod: data.paymentMethod,
          bookingStatus: "Pending" as const,
          ...(data.paymentMethod === PaymentMethod.ONLINE && {
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          }),
        };

        bookingToUse = await this._bookingRepository.bookService(
          userId,
          bookingData
        );
      }

      const slotIds: string[] = bookingToUse.timeSlotId.map((slot) =>
        (slot as ITimeSlot)._id
          ? (slot as ITimeSlot)._id.toString()
          : (slot as Types.ObjectId).toString()
      );

      if (data.paymentMethod === PaymentMethod.WALLET) {
        try {
          const userWallet = await this._walletRepository.getWalletByOwnerId(
            userId,
            "user"
          );

          if (!userWallet || userWallet.balance < data.bookingAmount) {
            if (!existingBooking && bookingToUse.timeSlotId) {
              await this._timeSlotService.releaseReservedSlots(
                data.technicianId,
                slotIds
              );
            }
            return {
              success: false,
              message: !userWallet
                ? "Wallet not found"
                : "Insufficient wallet balance",
            };
          }

          const newBookingId = new Date().getTime().toString().slice(-8);

          const walletUpdate =
            await this._walletRepository.updateWalletBalanceWithTransaction(
              userId,
              "user",
              data.bookingAmount,
              "Debit",
              `Payment for service booking #${newBookingId}`,
              newBookingId
            );

          if (!walletUpdate.wallet || !walletUpdate.transaction)
            throw new Error("Wallet debit failed");

          let fixifyShare = 0,
            technicianShare = 0;
          let paymentStatus: "Paid" | "Partial Paid" = "Partial Paid";

          if (service.serviceType === "fixed") {
            const technicianSubscription =
              await this._subscriptionPlanHistoryRepository.findActiveSubscriptionByTechnicianId(
                data.technicianId
              );

            if (!technicianSubscription)
              throw new Error("No active subscription for technician");

            const subscriptionPlan =
              await this._subscriptionPlanRepository.findSubscriptionPlanById(
                technicianSubscription.subscriptionPlanId.toString()
              );

            if (!subscriptionPlan)
              throw new Error("Subscription plan not found");

            fixifyShare = parseFloat(
              (
                data.bookingAmount *
                (subscriptionPlan.commissionRate / 100)
              ).toFixed(2)
            );

            technicianShare = parseFloat(
              (data.bookingAmount - fixifyShare).toFixed(2)
            );

            paymentStatus = "Paid";
          }

          const paymentData: CreatePaymentData = {
            userId,
            bookingId: bookingToUse._id.toString(),
            technicianId: data.technicianId,
            originalAmount: data.originalAmount,
            amountPaid: data.bookingAmount,
            paymentMethod: PaymentMethod.WALLET,
            paymentStatus,
            technicianPaid: false,
          };

          if (service.serviceType === "fixed") {
            paymentData.fixifyShare = fixifyShare;
            paymentData.technicianShare = technicianShare;
            if (data.offerId) paymentData.offerId = data.offerId;
            if (data.couponId) paymentData.couponId = data.couponId;
          } else paymentData.advanceAmount = data.bookingAmount;

          const newPayment = await this._paymentRepository.createPayment(
            paymentData
          );

          await this._bookingRepository.updateBooking(
            { _id: bookingToUse._id },
            { bookingStatus: "Booked", paymentId: newPayment._id }
          );

          await this._timeSlotService.confirmReservedSlots(
            data.technicianId,
            userId,
            slotIds
          );

          return {
            success: true,
            message:
              "Booking created and payment completed successfully using wallet",
            data: {
              ...bookingToUse.toObject(),
              paymentMethod: data.paymentMethod,
              paymentCompleted: true,
              requiresPayment: false,
              serviceType: service.serviceType,
            },
          };
        } catch (walletError) {
          console.error("Wallet payment failed:", walletError);
          if (!existingBooking && bookingToUse.timeSlotId) {
            await this._timeSlotService.releaseReservedSlots(
              data.technicianId,
              slotIds
            );
          }
          return {
            success: false,
            message: "Wallet payment failed. Please try again.",
          };
        }
      }

      try {
        const amountInCents = Math.round(data.bookingAmount * 100);
        const getClientUrl = () =>
          config.NODE_ENV === "production"
            ? config.CLIENT_URL || "https://www.fixify.homes"
            : config.CLIENT_URL || "http://localhost:5173";

        const session: Stripe.Checkout.Session =
          await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
              {
                price_data: {
                  currency: "inr",
                  product_data: {
                    name: "Fixify Service Booking",
                    description:
                      service.serviceType === "fixed"
                        ? "Booking for fixed service"
                        : "Advance payment for hourly service",
                  },
                  unit_amount: amountInCents,
                },
                quantity: 1,
              },
            ],
            metadata: {
              bookingId: bookingToUse._id.toString(),
              userId,
              serviceId: data.serviceId,
              technicianId: data.technicianId,
              serviceType: service.serviceType,
              originalAmount: data.originalAmount?.toString() || "",
              offerId: data.offerId || "",
              couponId: data.couponId || "",
            },
            success_url: `${getClientUrl()}/user/bookingsuccess?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${getClientUrl()}/user/payment-cancelled`,
          });

        return {
          success: true,
          message:
            service.serviceType === "fixed"
              ? "Booking created. Complete payment to confirm."
              : "Advance payment booking created. Complete payment to confirm.",
          data: {
            ...bookingToUse.toObject(),
            checkoutUrl: session.url,
            requiresPayment: true,
            paymentMethod: PaymentMethod.ONLINE,
            serviceType: service.serviceType,
          },
        };
      } catch (stripeError) {
        console.error("Stripe session creation failed:", stripeError);
        if (!existingBooking && bookingToUse.timeSlotId) {
          await this._timeSlotService.releaseReservedSlots(
            data.technicianId,
            slotIds
          );
        }
        return {
          success: false,
          message: "Failed to create payment session. Please try again.",
        };
      }
    } catch (error) {
      console.error("Error in bookService:", error);
      return { success: false, message: "Failed to create booking" };
    }
  }

  async verifyStripeSession(
    sessionId: string,
    userId: string
  ): Promise<BookServiceResponse> {
    try {
      console.log("Verifying Stripe session:", sessionId, "for user:", userId);

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed or session not found",
        };
      }

      const bookingId = session.metadata?.bookingId;
      const originalAmount = session.metadata?.originalAmount
        ? parseFloat(session.metadata.originalAmount)
        : undefined;
      const offerId = session.metadata?.offerId || undefined;
      const couponId = session.metadata?.couponId || undefined;

      if (!bookingId) {
        return { success: false, message: "Invalid or missing booking ID" };
      }

      const booking = await this._bookingRepository.getBookingDetailsById(
        bookingId
      );
      if (!booking) {
        return { success: false, message: "Booking not found" };
      }

      if (booking.expiresAt && booking.expiresAt < new Date()) {
        return {
          success: false,
          message: "Booking has expired. Please create a new booking.",
        };
      }

      const existingPayment = await this._paymentRepository.findByBookingId(
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
        };
      }

      if (booking.timeSlotId && booking.timeSlotId.length > 0) {
        const slotIds = (booking.timeSlotId as ITimeSlot[]).map((slot) =>
          slot._id.toString()
        );

        await this._timeSlotService.confirmReservedSlots(
          booking.technicianId._id.toString(),
          userId,
          slotIds
        );
      }

      const updatedBooking = await this._bookingRepository.updateBooking(
        { _id: bookingId },
        { bookingStatus: "Booked" }
      );
      if (!updatedBooking) {
        return { success: false, message: "Failed to update booking status" };
      }

      const service = booking.serviceId as IService;
      const isHourly = service.serviceType === "hourly";

      let fixifyShare = 0;
      let technicianShare = 0;

      if (!isHourly) {
        const technicianSubscription =
          await this._subscriptionPlanHistoryRepository.findActiveSubscriptionByTechnicianId(
            booking.technicianId._id.toString()
          );
        if (!technicianSubscription) {
          throw new Error("No active subscription plan found for technician");
        }

        const subscriptionPlan =
          await this._subscriptionPlanRepository.findSubscriptionPlanById(
            technicianSubscription.subscriptionPlanId.toString()
          );
        if (!subscriptionPlan) {
          throw new Error("Subscription plan not found");
        }

        const commissionRate = subscriptionPlan.commissionRate;
        const fixifySharePercentage = commissionRate / 100;
        fixifyShare = parseFloat(
          (booking.bookingAmount * fixifySharePercentage).toFixed(2)
        );
        technicianShare = parseFloat(
          (booking.bookingAmount - fixifyShare).toFixed(2)
        );
      }

      if (!isHourly && couponId) {
        const coupon = await this._couponRepository.findCouponById(couponId);
        if (coupon) {
          await this._couponRepository.addUserToCoupon(couponId, userId);
        } else {
          throw new Error(`Coupon with ID ${couponId} not found`);
        }
      }

      const paymentData: CreatePaymentData = {
        userId,
        bookingId: booking._id.toString(),
        technicianId: booking.technicianId._id.toString(),
        originalAmount,
        amountPaid: booking.bookingAmount,
        paymentMethod: "Online",
        paymentStatus: isHourly ? "Partial Paid" : "Paid",
        technicianPaid: false,
      };

      if (isHourly) {
        paymentData.advanceAmount = booking.bookingAmount;
      } else {
        paymentData.offerId = offerId;
        paymentData.couponId = couponId;
        paymentData.fixifyShare = fixifyShare;
        paymentData.technicianShare = technicianShare;
      }

      const newPayment = await this._paymentRepository.createPayment(
        paymentData
      );

      await this._bookingRepository.updateBooking(
        { _id: bookingId },
        { paymentId: newPayment._id }
      );

      return {
        success: true,
        message: isHourly
          ? "Advance payment verified for hourly service"
          : "Payment verified and booking completed",
        data: {
          ...updatedBooking.toObject(),
          paymentMethod: "Online",
          paymentCompleted: true,
        },
      };
    } catch (error) {
      console.error(
        "Error verifying Stripe session in booking service:",
        error
      );
      return {
        success: false,
        message: "Internal server error",
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

      const result = await this._bookingRepository.getAllBookings({
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
        };
      }

      const { userId, technicianId } = options || {};

      const booking = await this._bookingRepository.getBookingDetailsById(
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
        };
      }

      return {
        success: true,
        message: "Booking details retrieved successfully",
        data: booking,
      };
    } catch (error) {
      console.error("Error in getBookingById service:", error);
      return {
        success: false,
        message: "Failed to retrieve booking details",
      };
    }
  }

  async startService(
    bookingId: string,
    technicianId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { bookingId: string; status: string };
  }> {
    try {
      console.log(
        "entered to the start service function in the booking service"
      );
      console.log(
        `changing the status of the ${bookingId} by the technician whose technicianId is ${technicianId}`
      );

      const booking = (await this._bookingRepository.getBookingDetailsById(
        bookingId
      )) as IBookingDetails | null;

      console.log("fetched booking:", booking);

      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          message: "You are not authorized to complete this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          message: `Cannot complete booking with status: ${booking.bookingStatus}`,
        };
      }

      const updatedBooking = await this._bookingRepository.updateBooking(
        { _id: bookingId },
        { bookingStatus: "In Progress" }
      );

      if (!updatedBooking) {
        return { success: false, message: "Failed to update booking status" };
      }

      return {
        success: true,
        message: "Service started successfully",
        data: {
          bookingId: updatedBooking._id.toString(),
          status: updatedBooking.bookingStatus,
        },
      };
    } catch (error) {
      console.error("Error in starting the service:", error);
      return {
        success: false,
        message: "Failed to start the service",
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
  }> {
    try {
      console.log("Entering booking completion OTP generation");
      console.log("technicianId:", technicianId, "bookingId:", bookingId);

      if (!technicianId || !bookingId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Technician ID and Booking ID are required",
        };
      }

      const booking = (await this._bookingRepository.getBookingDetailsById(
        bookingId
      )) as IBookingDetails | null;

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
      const existingOtp = await this._redisService.get(existingOtpKey);

      if (existingOtp) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "OTP already sent. Please wait before requesting a new one.",
        };
      }

      const otp = await this._otpService.generateOtp();
      console.log(`Generated completion OTP for booking ${bookingId}:`, otp);

      const redisKey = this.getOtpRedisKey(
        bookingId,
        OtpPurpose.BOOKING_COMPLETION
      );
      await this._redisService.set(
        redisKey,
        otp,
        BOOKING_OTP_EXPIRATION_SECONDS
      );

      console.log("OTP stored in Redis with key:", redisKey);

      const bookingData = {
        customerName: booking.userId?.username || "Customer",
        serviceName: booking.serviceId?.name || "Service",
        technicianName: booking.technicianId?.username || "Technician",
        otp: otp,
        bookingId: bookingId,
      };

      let emailSent = false;
      try {
        await this._emailService.sendBookingCompletionEmail(
          booking.userId.email,
          bookingData
        );
        emailSent = true;
        console.log(
          "Completion OTP email sent to customer:",
          booking.userId.email
        );
      } catch (emailError) {
        console.error("Error sending completion OTP email:", emailError);
      }

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: emailSent
          ? "Completion OTP generated and sent to customer successfully"
          : "Completion OTP generated but email notification failed. OTP is still valid.",
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
    message: string;
    data?: { booking: IBookingDetails };
  }> {
    try {
      console.log("BookingService: Verifying completion OTP");
      console.log("technicianId:", technicianId);
      console.log("bookingId:", bookingId);
      console.log("provided OTP:", otp);

      if (!technicianId || !bookingId || !otp) {
        return {
          success: false,
          message: "Technician ID, Booking ID, and OTP are required",
        };
      }

      const booking = await this._bookingRepository.getBookingDetailsById(
        bookingId
      );

      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          message: "You are not authorized to complete this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
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

      const updatedBooking = await this._bookingRepository.updateBooking(
        { _id: bookingId },
        { bookingStatus: "Completed" }
      );

      if (!updatedBooking) {
        return {
          success: false,
          message: "Failed to update booking status",
        };
      }

      try {
        const technicianSubscription =
          await this._subscriptionPlanHistoryRepository.findActiveSubscriptionByTechnicianId(
            booking.technicianId._id.toString()
          );

        console.log(
          "fetched technician subscription plan in booking service:",
          technicianSubscription
        );

        if (!technicianSubscription) {
          throw new Error("No active subscription plan found for technician");
        }

        const subscriptionPlan =
          await this._subscriptionPlanRepository.findSubscriptionPlanById(
            technicianSubscription.subscriptionPlanId.toString()
          );

        if (!subscriptionPlan) {
          throw new Error("Subscription plan not found");
        }

        if (subscriptionPlan) {
          const walletCreditDelay = subscriptionPlan.WalletCreditDelay;

          const completionTime = new Date();
          const newCreditReleaseDate = new Date(completionTime);
          newCreditReleaseDate.setDate(
            newCreditReleaseDate.getDate() + walletCreditDelay
          );

          await this._paymentRepository.updatePayment(
            booking.paymentId._id.toString(),
            { creditReleaseDate: newCreditReleaseDate }
          );

          console.log(
            `Credit release date updated to ${newCreditReleaseDate} for booking ${bookingId}`
          );
        }
      } catch (error) {
        console.error("Error updating credit release date:", error);
      }

      const redisKey = this.getOtpRedisKey(
        bookingId,
        OtpPurpose.BOOKING_COMPLETION
      );
      await this._redisService.delete(redisKey);

      const completedBooking =
        (await this._bookingRepository.getBookingDetailsById(
          bookingId
        )) as IBookingDetails | null;

      if (!completedBooking) {
        return {
          message: "booking not found",
          success: false,
        };
      }

      console.log(
        `Booking ${bookingId} completed successfully by technician ${technicianId}. Payment will be processed according to subscription plan.`
      );

      return {
        success: true,
        message:
          "Service completed successfully. Payment will be credited according to your subscription plan.",
        data: { booking: completedBooking },
      };
    } catch (error) {
      console.error("Error in verifyCompletionOtp:", error);
      return {
        success: false,
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
          message: "User ID, Booking ID, and cancellation reason are required",
        };
      }

      const booking = await this._bookingRepository.getBookingDetailsById(
        bookingId
      );
      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      if (booking.userId._id.toString() !== userId) {
        return {
          success: false,
          message: "You are not authorized to cancel this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          message: `Cannot cancel booking with status: ${booking.bookingStatus}`,
        };
      }

      const timeSlots = booking.timeSlotId as ITimeSlot[];

      console.log("timeSlots extracted from booking:", timeSlots.length);

      if (!timeSlots || timeSlots.length === 0) {
        return {
          success: false,
          message: "Booking time slot information not found",
        };
      }

      const firstTimeSlot = timeSlots[0];
      const dateStr = firstTimeSlot.date;
      const timeStr = firstTimeSlot.startTime;

      console.log("Raw date:", dateStr, "Raw time:", timeStr);

      const [day, month, year] = dateStr.split("-");
      const jsDateStr = `${month}/${day}/${year} ${timeStr}`;
      const scheduledDate = new Date(jsDateStr);

      console.log("Parsed date string:", jsDateStr);
      console.log("Scheduled date object:", scheduledDate);
      console.log("Is valid date?", !isNaN(scheduledDate.getTime()));

      const now = new Date();

      console.log("Current time:", now);

      const timeDiffMs = scheduledDate.getTime() - now.getTime();
      const hoursUntilService = timeDiffMs / (1000 * 60 * 60);

      console.log("Time difference (ms):", timeDiffMs);
      console.log("Hours until service:", hoursUntilService);

      let refundPercentage = 0;
      if (hoursUntilService >= 6) {
        refundPercentage = 100;
        console.log("Refund case: >= 6 hours - 100%");
      } else if (hoursUntilService >= 2) {
        refundPercentage = 50;
        console.log("Refund case: 2-6 hours - 50%");
      } else {
        refundPercentage = 0;
        console.log("Refund case: < 2 hours - 0%");
      }

      console.log("Final refund percentage:", refundPercentage);

      const refundAmount = (booking.bookingAmount * refundPercentage) / 100;

      console.log("Cancellation details:", {
        scheduledDate: scheduledDate.toISOString(),
        hoursUntilService,
        refundPercentage,
        refundAmount,
      });

      const payment = await this._paymentRepository.findByBookingId(bookingId);
      if (!payment) {
        return {
          success: false,
          message: "Payment record not found",
        };
      }

      const updatedBooking = await this._bookingRepository.updateBooking(
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
          message: "Failed to update booking status",
        };
      }

      await this._paymentRepository.updatePayment(payment._id.toString(), {
        paymentStatus: refundAmount > 0 ? "Refunded" : "Paid",
        refundStatus: refundAmount > 0 ? "Refunded" : "Not Refunded",
        refundAmount: refundAmount,
        refundDate: refundAmount > 0 ? new Date() : undefined,
      });

      if (refundAmount > 0) {
        let userWallet = await this._walletRepository.getWalletByOwnerId(
          userId,
          "user"
        );
        if (!userWallet) {
          console.log("User wallet not found, creating new wallet");
          userWallet = await this._walletRepository.createWallet(
            userId,
            "user"
          );
        }

        await this._walletRepository.updateWalletBalanceWithTransaction(
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
        const slotIds = timeSlots.map((slot) => slot._id.toString());

        await this._timeSlotService.unblockMultipleSlots(
          booking.technicianId._id.toString(),
          slotIds
        );
        console.log(`Successfully freed up ${slotIds.length} time slots`);
      } catch (slotError) {
        console.error("Error freeing up time slots:", slotError);
      }

      console.log(
        `Booking ${bookingId} cancelled successfully by user ${userId}`
      );

      return {
        success: true,
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
          message:
            "Technician ID, Booking ID, and cancellation reason are required",
        };
      }

      const booking = await this._bookingRepository.getBookingDetailsById(
        bookingId
      );
      if (!booking) {
        return {
          success: false,
          message: "Booking not found",
        };
      }

      if (booking.technicianId._id.toString() !== technicianId) {
        return {
          success: false,
          message: "You are not authorized to cancel this booking",
        };
      }

      if (booking.bookingStatus !== "Booked") {
        return {
          success: false,
          message: `Cannot cancel booking with status: ${booking.bookingStatus}`,
        };
      }

      const timeSlots = booking.timeSlotId as ITimeSlot[];
      if (!timeSlots || timeSlots.length === 0) {
        return {
          success: false,
          message: "Booking time slot information not found",
        };
      }

      const firstTimeSlot = timeSlots[0];
      if (!firstTimeSlot || !firstTimeSlot.date || !firstTimeSlot.startTime) {
        return {
          success: false,
          message: "Booking time slot information not found",
        };
      }

      const dateStr = firstTimeSlot.date;
      const timeStr = firstTimeSlot.startTime;
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
          message: "Cannot cancel bookings scheduled for today",
        };
      }

      if (hoursUntilService < 2) {
        return {
          success: false,
          message: "Cannot cancel bookings with less than 2 hours notice",
        };
      }

      console.log("Technician cancellation validation passed:", {
        scheduledDate: scheduledDate.toISOString(),
        hoursUntilService,
        isToday,
      });

      const payment = await this._paymentRepository.findByBookingId(bookingId);
      if (!payment) {
        return {
          success: false,
          message: "Payment record not found",
        };
      }

      const updatedBooking = await this._bookingRepository.updateBooking(
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
          message: "Failed to update booking status",
        };
      }

      const fullRefundAmount = booking.bookingAmount;

      await this._paymentRepository.updatePayment(payment._id.toString(), {
        paymentStatus: "Refunded",
        refundStatus: "Refunded",
        refundAmount: fullRefundAmount,
        refundDate: new Date(),
      });

      let userWallet = await this._walletRepository.getWalletByOwnerId(
        booking.userId._id.toString(),
        "user"
      );

      if (!userWallet) {
        console.log("User wallet not found, creating new wallet");
        userWallet = await this._walletRepository.createWallet(
          booking.userId._id.toString(),
          "user"
        );
      }

      await this._walletRepository.updateWalletBalanceWithTransaction(
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
        const slotIds = timeSlots.map((slot) => slot._id.toString());

        await this._timeSlotService.unblockMultipleSlots(technicianId, slotIds);
        console.log(`Successfully freed up ${slotIds.length} time slots`);
      } catch (slotError) {
        console.error("Error freeing up time slots:", slotError);
      }

      console.log(
        `Booking ${bookingId} cancelled successfully by technician ${technicianId}`
      );

      return {
        success: true,
        message: `Booking cancelled successfully. Customer will receive a full refund of ₹${fullRefundAmount}.`,
        data: {
          booking: updatedBooking,
        },
      };
    } catch (error) {
      console.error("Error in cancelBookingByTechnician:", error);
      return {
        success: false,
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
          message: "User ID, Booking ID, and rating are required",
        };
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return {
          success: false,
          message: "Rating must be an integer between 1 and 5",
        };
      }

      if (review && review.trim().length > 500) {
        return {
          success: false,
          message: "Review cannot exceed 500 characters",
        };
      }

      const booking = await this._bookingRepository.getBookingDetailsById(
        bookingId,
        userId
      );

      if (!booking) {
        return {
          success: false,
          message:
            "Booking not found or you don't have permission to rate this service",
        };
      }

      if (booking.bookingStatus !== "Completed") {
        return {
          success: false,
          message: "You can only rate completed services",
        };
      }

      if (booking.isRated) {
        return {
          success: false,
          message: "This service has already been rated",
        };
      }

      const existingRating = await this._ratingRepository.getRatingByBookingId(
        bookingId
      );
      if (existingRating) {
        return {
          success: false,
          message: "Rating already exists for this booking",
        };
      }

      const newRating = await this._ratingRepository.createRating({
        userId,
        technicianId: booking.technicianId._id.toString(),
        serviceId: booking.serviceId._id.toString(),
        bookingId,
        rating,
        review,
      });

      console.log("newley created rating for the service:", newRating);

      const updatedBooking = await this._bookingRepository.updateBooking(
        { _id: bookingId },
        { isRated: true }
      );

      if (!updatedBooking) {
        return {
          success: false,
          message: "Failed to update booking status after rating",
        };
      }

      console.log(
        `Service rated successfully - Booking: ${bookingId}, Rating: ${rating}/5`
      );

      return {
        success: true,
        message: "Service rated successfully",
        data: {
          booking: updatedBooking,
        },
      };
    } catch (error) {
      console.error("Error in rateService:", error);
      return {
        success: false,
        message: "Failed to rate service",
      };
    }
  }

  async getRating(bookingId: string): Promise<{
    success: boolean;
    message: string;
    data?: IRating | null;
  }> {
    try {
      console.log(
        "entering to the booking service getting the rating for the booking"
      );
      console.log("bookingId in the booking service:", bookingId);
      const response = await this._ratingRepository.getRatingByBookingId(
        bookingId
      );
      console.log("response from the rating repository:", response);
      return {
        success: true,
        message: "Rating fetched successfully",
        data: response,
      };
    } catch (error) {
      console.log("error occured while fetching the rating:", error);
      return {
        success: false,
        message: "Failed to fetch the rating",
      };
    }
  }

  async getMostBookedServices(
    limit?: number,
    days?: number
  ): Promise<{ success: boolean; message: string; data?: IService[] }> {
    try {
      console.log(
        "entered to the booking services that fetches the most booked services:"
      );
      console.log(
        "limit in the getmostbooked services function in the booking service:",
        limit
      );
      console.log(
        "days in the getmostbooked services function in the booking service:",
        days
      );

      const serviceStats =
        await this._bookingRepository.getMostBookedServiceIds(limit, days);
      console.log("service stats from booking repository:", serviceStats);

      const serviceIds = serviceStats.map((stat) => stat.serviceId);
      console.log("extracted serviceIds:", serviceIds);

      const services = await this._serviceRepository.getServicesByIds(
        serviceIds
      );
      console.log("services from service repository:", services);

      return {
        success: true,
        message: "Most booked services fetched successfully",
        data: services,
      };
    } catch (error) {
      console.log("Error in getMostBookedServices service:", error);
      return {
        success: false,
        message: "Failed to fetch most booked services",
      };
    }
  }

  async totalBookings(): Promise<number> {
    try {
      console.log(
        "entered to the booking service that fetches the total bookings"
      );
      const totalBookings = await this._bookingRepository.totalBookings();
      console.log("fetched total bookings:", totalBookings);
      return totalBookings;
    } catch (error) {
      console.log("error occured while fetchning the total bookings:", error);
      return 0;
    }
  }

  async getTotalRevenue(): Promise<number> {
    try {
      console.log(
        "entered into the total revenue function that fetches the total revenue in the booking service"
      );
      const totalRevenue = await this._paymentRepository.getTotalRevenue();
      console.log("BOOKING SERVICE: PaymentRepository returned:", totalRevenue);
      return totalRevenue;
    } catch (error) {
      console.log("error occurred while fetching the total revenue:", error);
      return 0;
    }
  }

  async getBookingStatusDistribution(): Promise<{
    success: boolean;
    message: string;
    data?: Array<{ status: string; count: number }>;
  }> {
    try {
      console.log("entered to get booking status distribution");
      const statusData =
        await this._bookingRepository.getBookingStatusDistribution();
      return {
        success: true,
        message: "Booking status distribution fetched successfully",
        data: statusData,
      };
    } catch (error) {
      console.log(
        "error occurred while fetching booking status distribution:",
        error
      );
      return {
        success: false,
        message: "Failed to fetch booking status distribution",
      };
    }
  }

  async getRevenueTrends(days: number = 30): Promise<{
    success: boolean;
    message: string;
    data?: Array<{ date: string; revenue: number }>;
  }> {
    try {
      console.log("entered to get revenue trends");
      const revenueData = await this._paymentRepository.getRevenueByDays(days);
      return {
        success: true,
        message: "Revenue trends fetched successfully",
        data: revenueData,
      };
    } catch (error) {
      console.log("error occurred while fetching revenue trends:", error);
      return {
        success: false,
        message: "Failed to fetch revenue trends",
      };
    }
  }

  async getServiceCategoryPerformance(
    limit: number = 10,
    days: number = 30
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      categoryName: string;
      bookingCount: number;
      categoryId: string;
    }>;
  }> {
    try {
      console.log("entered to get service category performance");
      const categoryData =
        await this._bookingRepository.getServiceCategoryPerformance(
          limit,
          days
        );
      return {
        success: true,
        message: "Service category performance fetched successfully",
        data: categoryData,
      };
    } catch (error) {
      console.log(
        "error occurred while fetching service category performance:",
        error
      );
      return {
        success: false,
        message: "Failed to fetch service category performance",
      };
    }
  }
}

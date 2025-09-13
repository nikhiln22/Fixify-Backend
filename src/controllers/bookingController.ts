import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IBookingService } from "../interfaces/Iservices/IbookingService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { ISocketNotificationData } from "../interfaces/DTO/IServices/InotificationService";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { INotificationService } from "../interfaces/Iservices/InotificationService";

@injectable()
export class BookingController {
  constructor(
    @inject("IBookingService") private _bookingService: IBookingService,
    @inject("INotificationService")
    private _notificationService: INotificationService
  ) {}

  async bookService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the user booking the controller function");
      const userId = req.user?.id;
      const data = req.body;
      const paymentMethod = data.paymentMethod;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.bookService(
        userId,
        data
      );

      if (serviceResponse.success && serviceResponse.data) {
        const booking = serviceResponse.data;
        const technicianId = booking.technicianId.toString();

        try {
          if (paymentMethod === "wallet") {
            const userNotification =
              await this._notificationService.createNotification({
                recipientId: userId,
                recipientType: "user",
                title: "Booking Confirmed",
                message: `Your booking has been confirmed and payment processed via wallet.`,
                type: "booking_confirmed",
              });

            const userSocketData: ISocketNotificationData = {
              id: userNotification._id.toString(),
              title: userNotification.title,
              message: userNotification.message,
              type: userNotification.type,
              createdAt: userNotification.createdAt,
              recipientId: userNotification.recipientId.toString(),
              recipientType: userNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`user_${userId}`)
              .emit("new_notification", userSocketData);

            const technicianNotification =
              await this._notificationService.createNotification({
                recipientId: technicianId,
                recipientType: "technician",
                title: "New Confirmed Booking",
                message: `You have received a new confirmed booking with payment completed.`,
                type: "booking_confirmed",
              });

            const technicianSocketData: ISocketNotificationData = {
              id: technicianNotification._id.toString(),
              title: technicianNotification.title,
              message: technicianNotification.message,
              type: technicianNotification.type,
              createdAt: technicianNotification.createdAt,
              recipientId: technicianNotification.recipientId.toString(),
              recipientType: technicianNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`technician_${technicianId}`)
              .emit("new_notification", technicianSocketData);
          } else if (paymentMethod === "Online") {
            const userNotification =
              await this._notificationService.createNotification({
                recipientId: userId,
                recipientType: "user",
                title: "Booking Request Submitted",
                message: `Your booking request has been submitted. Please complete payment to confirm.`,
                type: "booking_submitted",
              });

            const userSocketData: ISocketNotificationData = {
              id: userNotification._id.toString(),
              title: userNotification.title,
              message: userNotification.message,
              type: userNotification.type,
              createdAt: userNotification.createdAt,
              recipientId: userNotification.recipientId.toString(),
              recipientType: userNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`user_${userId}`)
              .emit("new_notification", userSocketData);
          }

          console.log(`Notifications sent for ${paymentMethod} payment`);
        } catch (notificationError) {
          console.log("Failed to send notifications:", notificationError);
        }

        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to book service"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while booking the service:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyStripeSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const sessionId = req.params.sessionId as string;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.verifyStripeSession(
        sessionId,
        userId
      );

      if (serviceResponse.success) {
        try {
          const userNotification =
            await this._notificationService.createNotification({
              recipientId: userId,
              recipientType: "user",
              title: "Booking Confirmed",
              message: `Your payment has been processed successfully. Your booking is now confirmed.`,
              type: "booking_confirmed",
            });

          const userSocketData: ISocketNotificationData = {
            id: userNotification._id.toString(),
            title: userNotification.title,
            message: userNotification.message,
            type: userNotification.type,
            createdAt: userNotification.createdAt,
            recipientId: userNotification.recipientId.toString(),
            recipientType: userNotification.recipientType,
            isRead: false,
          };

          req.io?.to(`user_${userId}`).emit("new_notification", userSocketData);

          const booking = serviceResponse.data;
          if (booking && booking.technicianId) {
            const technicianId = booking.technicianId.toString();

            const technicianNotification =
              await this._notificationService.createNotification({
                recipientId: technicianId,
                recipientType: "technician",
                title: "New Confirmed Booking",
                message: `Payment has been confirmed. You have a new confirmed booking.`,
                type: "booking_confirmed",
              });

            req.io?.to(`technician_${technicianId}`).emit("new_notification", {
              id: technicianNotification._id.toString(),
              title: technicianNotification.title,
              message: technicianNotification.message,
              type: technicianNotification.type,
              createdAt: technicianNotification.createdAt!,
              recipientId: technicianNotification.recipientId.toString(),
              recipientType: technicianNotification.recipientType,
            });
          }
        } catch (notificationError) {
          console.log(
            "Failed to send payment confirmation notifications:",
            notificationError
          );
        }

        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("not completed")
          ? HTTP_STATUS.NOT_COMPLETED
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify payment"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while verifying the stripe session:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllBookings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching all the bookings from the admin controller");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const filter = (req.query.filter as string) || undefined;
      const role = req.user?.role;

      console.log("filter status in the admin controller:", filter);

      const serviceResponse = await this._bookingService.getAllBookings({
        page,
        limit,
        search,
        filter,
        role,
      });

      console.log(
        "result from fetching all the bookings for the admin controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch bookings"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the bookings for the admin",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getBookingDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Controller: Getting booking details");

      const { bookingId } = req.params;

      if (!bookingId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Booking ID is required"));
        return;
      }

      console.log("Fetching booking details for admin:", bookingId);

      const serviceResponse = await this._bookingService.getBookingById(
        bookingId,
        {}
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch booking details"
            )
          );
      }
    } catch (error) {
      console.error("Error in getBookingDetails controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the user controller that cancels the booking");
      const { bookingId } = req.params;
      const userId = req.user?.id;
      const { cancellationReason } = req.body;
      console.log("received Data:", cancellationReason);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.cancelBookingByUser(
        userId,
        bookingId,
        cancellationReason
      );

      console.log(
        "response from the booking service after cancelling the booking by user:",
        serviceResponse
      );

      if (serviceResponse.success) {
        try {
          const booking = serviceResponse.data?.booking;
          const technicianId =
            booking?.technicianId?._id?.toString() ||
            booking?.technicianId?.toString();

          if (technicianId) {
            const technicianNotification =
              await this._notificationService.createNotification({
                recipientId: technicianId,
                recipientType: "technician",
                title: "Booking Cancelled",
                message: `A booking #${bookingId
                  .slice(-8)
                  .toUpperCase()} has been cancelled by the customer. Reason: ${cancellationReason} Reason: ${cancellationReason}`,
                type: "booking_cancelled",
              });

            const technicianSocketData: ISocketNotificationData = {
              id: technicianNotification._id.toString(),
              title: technicianNotification.title,
              message: technicianNotification.message,
              type: technicianNotification.type,
              createdAt: technicianNotification.createdAt,
              recipientId: technicianNotification.recipientId.toString(),
              recipientType: technicianNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`technician_${technicianId}`)
              .emit("new_notification", technicianSocketData);
            console.log(
              `Cancellation notification sent to technician ${technicianId}`
            );
          }

          const userNotification =
            await this._notificationService.createNotification({
              recipientId: userId,
              recipientType: "user",
              title: "Booking Cancelled Successfully",
              message: serviceResponse.message,
              type: "booking_cancelled",
            });

          const userSocketData: ISocketNotificationData = {
            id: userNotification._id.toString(),
            title: userNotification.title,
            message: userNotification.message,
            type: userNotification.type,
            createdAt: userNotification.createdAt,
            recipientId: userNotification.recipientId.toString(),
            recipientType: userNotification.recipientType,
            isRead: false,
          };

          req.io?.to(`user_${userId}`).emit("new_notification", userSocketData);
          console.log(
            `Cancellation confirmation notification sent to user ${userId}`
          );
        } catch (notificationError) {
          console.log(
            "Failed to send cancellation notifications:",
            notificationError
          );
        }
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to cancel booking"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while user cancelling the booking:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async cancelBookingByTechnician(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "technician controller which cancels the booking from the technician controller"
      );
      const technicianId = req.user?.id;
      const { bookingId } = req.params;
      const { cancellationReason } = req.body;
      console.log(
        "technicianId in the cancelbooking controller function:",
        technicianId
      );
      console.log(
        "bookingId in the cancelbooking controller function:",
        bookingId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._bookingService.cancelBookingByTechnician(
          technicianId,
          bookingId,
          cancellationReason
        );
      console.log(
        "response from the booking service after technician is cancelling the booking:",
        serviceResponse
      );

      if (serviceResponse.success) {
        try {
          const booking = serviceResponse.data?.booking;
          const userId =
            booking?.userId?._id?.toString() || booking?.userId?.toString();

          if (userId) {
            const userNotification =
              await this._notificationService.createNotification({
                recipientId: userId,
                recipientType: "user",
                title: "Booking Cancelled by Technician",
                message: `Your booking #${bookingId
                  .slice(-8)
                  .toUpperCase()} has been cancelled by the technician. You will receive a full refund. Reason: ${cancellationReason}`,
                type: "booking_cancelled",
              });

            const userSocketData: ISocketNotificationData = {
              id: userNotification._id.toString(),
              title: userNotification.title,
              message: userNotification.message,
              type: userNotification.type,
              createdAt: userNotification.createdAt!,
              recipientId: userNotification.recipientId.toString(),
              recipientType: userNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`user_${userId}`)
              .emit("new_notification", userSocketData);
            console.log(
              `Technician cancellation notification sent to user ${userId}`
            );
          }

          const technicianNotification =
            await this._notificationService.createNotification({
              recipientId: technicianId,
              recipientType: "technician",
              title: "Booking Cancelled Successfully",
              message: `You have successfully cancelled booking #${bookingId
                .slice(-8)
                .toUpperCase()}.`,
              type: "booking_cancelled",
            });

          const technicianSocketData: ISocketNotificationData = {
            id: technicianNotification._id.toString(),
            title: technicianNotification.title,
            message: technicianNotification.message,
            type: technicianNotification.type,
            createdAt: technicianNotification.createdAt!,
            recipientId: technicianNotification.recipientId.toString(),
            recipientType: technicianNotification.recipientType,
            isRead: false,
          };

          req.io
            ?.to(`technician_${technicianId}`)
            .emit("new_notification", technicianSocketData);
          console.log(
            `Cancellation confirmation notification sent to technician ${technicianId}`
          );
        } catch (notificationError) {
          console.log(
            "Failed to send technician cancellation notifications:",
            notificationError
          );
        }

        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to cancel booking"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while technician is cancelling the booking:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async generateBookingCompletionOtp(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entering to the technician controller function that generates the completion otp"
      );
      const technicianId = req.user?.id;
      const bookingId = req.params.bookingId;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.generateCompletionOtp(
        technicianId,
        bookingId
      );

      console.log("response in the generate otp controller:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to generate completion OTP"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while generating the completion otp:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyBookingCompletionOtp(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("entering the controller that verify the work completion");
      const { otp } = req.body;
      const { bookingId } = req.params;
      const technicianId = req.user?.id;

      console.log("bookingId and technicianId in the verify controller:", {
        bookingId,
        technicianId,
      });

      console.log("received data:", otp);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.verifyCompletionOtp(
        technicianId,
        bookingId,
        otp
      );
      console.log(
        "response after verifying the otp from the booking service:",
        serviceResponse
      );

      if (serviceResponse.success) {
        try {
          const booking = serviceResponse.data?.booking;
          const userId =
            booking?.userId?._id?.toString() || booking?.userId?.toString();
          const paymentDetails = booking?.paymentId;
          const technicianShare = paymentDetails?.technicianShare;
          const creditReleaseDate = paymentDetails?.creditReleaseDate;

          if (userId) {
            const userNotification =
              await this._notificationService.createNotification({
                recipientId: userId,
                recipientType: "user",
                title: "Service Completed",
                message: `Your service for booking #${bookingId
                  .slice(-8)
                  .toUpperCase()} has been completed successfully. Please rate your experience.`,
                type: "service_completed",
              });

            const userSocketData: ISocketNotificationData = {
              id: userNotification._id.toString(),
              title: userNotification.title,
              message: userNotification.message,
              type: userNotification.type,
              createdAt: userNotification.createdAt!,
              recipientId: userNotification.recipientId.toString(),
              recipientType: userNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`user_${userId}`)
              .emit("new_notification", userSocketData);
            console.log(
              `Service completion notification sent to user ${userId}`
            );
          }

          let technicianMessage = `You have successfully completed booking #${bookingId
            .slice(-8)
            .toUpperCase()}.`;

          if (technicianShare && creditReleaseDate) {
            const releaseDate = new Date(creditReleaseDate);
            const formattedDate = releaseDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            technicianMessage += ` Your payment of ₹${technicianShare} will be credited to your wallet on ${formattedDate}.`;
            const technicianNotification =
              await this._notificationService.createNotification({
                recipientId: technicianId,
                recipientType: "technician",
                title: "Service Completed - Payment Scheduled",
                message: technicianMessage,
                type: "service_completed_payment",
              });

            const technicianSocketData: ISocketNotificationData = {
              id: technicianNotification._id.toString(),
              title: technicianNotification.title,
              message: technicianNotification.message,
              type: technicianNotification.type,
              createdAt: technicianNotification.createdAt!,
              recipientId: technicianNotification.recipientId.toString(),
              recipientType: technicianNotification.recipientType,
              isRead: false,
            };

            req.io
              ?.to(`technician_${technicianId}`)
              .emit("new_notification", technicianSocketData);
            console.log(
              `Service completion and payment schedule notification sent to technician ${technicianId}`
            );
            res
              .status(HTTP_STATUS.OK)
              .json(createSuccessResponse(serviceResponse.message));
          }
        } catch (notificationError) {
          console.log(
            "Failed to send service completion notifications:",
            notificationError
          );
        }
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("Invalid OTP")
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify completion OTP"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while verifying the completion otp:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  // async getTechnicianAverageRating(req: Request, res: Response): Promise<void> {
  //   try {
  //     const technicianId = req.query.technicianId;
  //     console.log(first)
  //   } catch (error) {

  //   }
  // }

  async rateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering the user controller which rate the services");
      const { bookingId } = req.params;
      const userId = req.user?.id;
      const { rating, review } = req.body;

      console.log("received data:", { bookingId, userId, rating, review });

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._bookingService.rateService(
        userId,
        bookingId,
        rating,
        review || ""
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to rate service"
            )
          );
      }
    } catch (error) {
      console.error("Error in rateService controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getRating(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entered the function which fetched the booking rating for a specified booking"
      );
      const { bookingId } = req.params;
      console.log("bookingId in the user controller:", bookingId);

      const serviceResponse = await this._bookingService.getRating(bookingId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch rating"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the rating for a booking:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}

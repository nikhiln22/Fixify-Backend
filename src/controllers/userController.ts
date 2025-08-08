import { IUserController } from "../interfaces/Icontrollers/IuserController";
import { IUserService } from "../interfaces/Iservices/IuserService";
import { IServiceService } from "../interfaces/Iservices/IserviceService";
import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { IBookingService } from "../interfaces/Iservices/IbookingService";
import { IChatService } from "../interfaces/Iservices/IchatService";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { ICouponService } from "../interfaces/Iservices/IcouponService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { INotificationService } from "../interfaces/Iservices/InotificationService";
import { ISocketNotificationData } from "../interfaces/DTO/IServices/InotificationService";

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject("IUserService") private _userService: IUserService,
    @inject("IServiceService") private _serviceService: IServiceService,
    @inject("IAddressService") private _addressService: IAddressService,
    @inject("ITechnicianService")
    private _technicianService: ITechnicianService,
    @inject("ITimeSlotService") private _timeSlotService: ITimeSlotService,
    @inject("IBookingService") private _bookingService: IBookingService,
    @inject("IChatService") private _chatService: IChatService,
    @inject("ICouponService") private _couponService: ICouponService,
    @inject("IOfferService") private _offerService: IOfferService,
    @inject("INotificationService")
    private _notificationService: INotificationService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the register function in userController");
      const data = req.body;
      console.log("data:", data);
      const serviceResponse = await this._userService.userSignUp(data);
      console.log("response in register:", serviceResponse);
      if (serviceResponse.success) {
        res.status(HTTP_STATUS.CREATED).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
              tempUserId: serviceResponse.tempUserId,
            },
            serviceResponse.message
          )
        );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Registration failed"
            )
          );
      }
    } catch (error) {
      console.log("error occured", error);
      console.log("error occurred", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the verify otp function in userController");
      const data = req.body;
      console.log("userData in verifyOtp controller:", data);
      const serviceResponse = await this._userService.verifyOtp(data);
      console.log("response in verifyOtp controller:", serviceResponse);
      if (serviceResponse.success) {
        res
          .status(200)
          .json(
            createSuccessResponse(
              serviceResponse.userData || null,
              serviceResponse.message
            )
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("expired")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("Invalid OTP")
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "OTP verification failed"
            )
          );
      }
    } catch (error) {
      console.log("error occured:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the resend otp functionality in the ");
      const { email } = req.body;
      const serviceResponse = await this._userService.resendOtp(email);
      console.log("response from the resendotp controller:", serviceResponse);
      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
              tempUserId: serviceResponse.tempUserId,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to resend OTP"
            )
          );
      }
    } catch (error) {
      console.log("error in the resendOtp controller", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering forgotPassword function in userController");
      const { email } = req.body;

      const serviceResponse = await this._userService.forgotPassword({ email });
      console.log("Response from forgotPassword service:", serviceResponse);

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to send reset email"
            )
          );
      }
    } catch (error) {
      console.log("Error in forgotPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering resetPassword function in userController");
      const { email, password } = req.body;

      const serviceResponse = await this._userService.resetPassword({
        email,
        password,
      });
      console.log("Response from resetPassword service:", serviceResponse);

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
              serviceResponse.message || "Failed to reset password"
            )
          );
      }
    } catch (error) {
      console.log("Error in resetPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the user login function in usercontroller");
      const data = req.body;

      const serviceResponse = await this._userService.login(data);
      console.log("response from the login controller", serviceResponse);

      if (serviceResponse.success) {
        res.cookie("refresh_token", serviceResponse.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              user: serviceResponse.data,
              access_token: serviceResponse.access_token,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("invalid password")
          ? HTTP_STATUS.UNAUTHORIZED
          : serviceResponse.message?.includes("blocked")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(createErrorResponse(serviceResponse.message || "Login failed"));
      }
    } catch (error) {
      console.log("error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getMostBookedServices(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "fetching the most booked services for the user in user controller"
      );
      const limit = parseInt(req.query.limit as string) || undefined;
      const days = parseInt(req.query.days as string) || undefined;

      const serviceResponse = await this._bookingService.getMostBookedServices(
        limit,
        days
      );
      console.log("response from getMostBookedServices:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch most booked services"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching most booked services:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the categories");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const serviceResponse = await this._serviceService.getAllCategories({
        page,
        limit,
        search,
      });

      console.log("result from the fetching all categories:", serviceResponse);

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
              serviceResponse.message || "Failed to send chat message"
            )
          );
      }
    } catch (error) {
      console.log("Error sending chat:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      console.log("services fetching to be listed in the user side");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const categoryId = req.query.category as string;

      const serviceResponse = await this._serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
      });

      console.log(
        "result from the services fetching controller:",
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
              serviceResponse.message || "Failed to fetch services"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching the services:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching services"));
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Entering user profile fetch");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._userService.getUserProfile(userId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.user, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch profile"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async editProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the user editing the profile function");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      console.log("Received form data:", req.body);
      console.log("Received files:", req.file);

      const profileUpdateData = {
        username: req.body.username,
        phone: req.body.phone,
        image: req.file?.path as string | undefined,
      };

      console.log("userId from the edit profile:", userId);
      console.log("Profile update data:", profileUpdateData);

      const serviceResponse = await this._userService.editProfile(
        userId,
        profileUpdateData
      );

      console.log(
        "response in the user editing profile function:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.user, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to update profile"
            )
          );
      }
    } catch (error) {
      console.log("Error in editProfile controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the controller for fetching the user address");
      const userId = req.user?.id;
      console.log("userId from the address fetching controller:", userId);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._addressService.getUserAddresses(
        userId
      );
      console.log(
        "response from the user controller fetching the user address:",
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
              serviceResponse.message || "Failed to fetch addresses"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching the user address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the user address");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const addressData = req.body;
      console.log("address Data received:", req.body);

      const serviceResponse = await this._addressService.addAddress(
        userId,
        addressData
      );

      console.log("response from the addAddress service:", serviceResponse);

      if (serviceResponse.success) {
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
              serviceResponse.message || "Failed to add address"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding new address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("deleting the already existing address of the user");
      const userId = req.user?.id;
      const addressId = req.params.addressId;
      console.log("userId from the address deleting controller:", userId);
      console.log("addressId from the address deleting controller:", addressId);

      if (!userId || !addressId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._addressService.deleteAddress(
        addressId,
        userId
      );
      console.log(
        "response from the user controller deleting the user address:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(null, serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to delete address"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while deleting the address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getServiceDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the service details for the user");
      const serviceId = req.params.serviceId;
      console.log("serviceId in the user controller:", serviceId);

      const serviceResponse = await this._serviceService.getServiceDetails(
        serviceId
      );
      console.log("response in the user controller:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch service details"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the service details for the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getNearbyTechnicians(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the function which fetches the nearby technicians for the user:"
      );

      const designationId = req.query.designationId as string;
      const userLongitude = parseFloat(req.query.longitude as string);
      const userLatitude = parseFloat(req.query.latitude as string);
      const radius = req.query.radius
        ? parseFloat(req.query.radius as string)
        : 10;

      if (!designationId || isNaN(userLongitude) || isNaN(userLatitude)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              "Invalid or missing parameters. Required: designationId, longitude (user's), latitude (user's)"
            )
          );
        return;
      }

      const serviceResponse =
        await this._technicianService.getNearbyTechnicians(
          designationId,
          userLongitude,
          userLatitude,
          radius
        );

      console.log("response in the user controller:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch nearby technicians"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the nearby technicians for the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log("finding the time slots for the user");
      const technicianId = req.params.technicianId;
      const includePast = req.query.includePast === "true";
      console.log("technicianId in the user controller:", technicianId);

      const userFilters = {
        isAvailable: true,
        isBooked: false,
      };

      const serviceResponse = await this._timeSlotService.getTimeSlots(
        technicianId,
        includePast,
        userFilters
      );
      console.log(
        "response from the get time slots user controller:",
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
              serviceResponse.message || "Failed to fetch time slots"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the time slots for the user",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async bookService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the user booking the controller function");
      const userId = req.user?.id;
      const data = req.body;
      console.log("Received Data:", data);

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
      console.log(
        "response from the user service booking controller:",
        serviceResponse
      );

      if (serviceResponse.success && serviceResponse.data) {
        const booking = serviceResponse.data;
        const technicianId = booking.technicianId.toString();

        try {
          const notification =
            await this._notificationService.createNotification({
              recipientId: technicianId,
              recipientType: "technician",
              title: "New Booking Request",
              message: `You have received a new service booking request`,
              type: "booking_created",
            });

          const socketData: ISocketNotificationData = {
            id: notification._id.toString(),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            createdAt: notification.createdAt!,
            recipientId: notification.recipientId.toString(),
            recipientType: notification.recipientType,
          };

          req.io
            ?.to(`technician_${technicianId}`)
            .emit("new_notification", socketData);
          console.log(`Notification sent to technician ${technicianId}`);
        } catch (notificationError) {
          console.log("Failed to send notification:", notificationError);
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
      console.log(
        "entering to the verifyStripeSession in the user controller function for booking"
      );

      const userId = req.user?.id;
      const sessionId = req.params.sessionId as string;
      console.log("userId in the stripe verify function:", userId);
      console.log("sessionId in the stripe verify function:", sessionId);

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

      console.log(
        "result from the verifying stripe session in user controller:",
        serviceResponse
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
      console.log("entering to the all bookings fetching for the user");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const userId = req.user?.id;
      const search = req.query.search as string;
      const filter = req.query.filter as string;

      const serviceResponse = await this._bookingService.getAllBookings({
        page,
        limit,
        userId,
        search,
        filter,
        role: "user",
      });
      console.log(
        "result from the fetching all bookings for users controller:",
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
      console.error("Error in getAllBookings controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching bookings"));
    }
  }

  async getBookingDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("Controller: Getting booking details");

      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      if (!bookingId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Booking ID is required"));
        return;
      }

      console.log("Fetching booking details for:", bookingId, "User:", userId);

      const serviceResponse = await this._bookingService.getBookingById(
        bookingId,
        {
          userId: userId,
        }
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

  async addMoney(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the function which adds the money to the user wallet"
      );
      const userId = req.user?.id;
      const { amount } = req.body;
      console.log("userId in the add money controller:", userId);
      console.log("Received Data:", amount);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._userService.addMoney(userId, amount);
      console.log(
        "result in the usercontroller for adding money in wallet:",
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
              serviceResponse.message || "Failed to add money to wallet"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred in the user controller while adding the money to wallet:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyWalletStripeSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entering to the verifyStripeSession in the user controller function for wallet"
      );

      const userId = req.user?.id;
      const sessionId = req.params.sessionId as string;
      console.log("userId in the verify stripe session for wallet:", userId);
      console.log(
        "sessionId in the verify stripe session for wallet:",
        sessionId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._userService.verifyWalletStripeSession(
        sessionId,
        userId
      );

      console.log(
        "result from the verifying stripe session in user controller:",
        serviceResponse
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
          : serviceResponse.message?.includes("not completed")
          ? HTTP_STATUS.NOT_COMPLETED
          : serviceResponse.message?.includes("not belong")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify wallet payment"
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

  async getWalletBalance(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the wallet balance for the user in the user controller function"
      );
      const userId = req.user?.id;
      console.log(
        "userId in the getWalletBalance function in user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._userService.getWalletBalance(userId);
      console.log(
        "response in the user controller for fetching the user wallet balance:",
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
              serviceResponse.message || "Failed to fetch wallet balance"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the user wallet balance:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getWalletTransactions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching the wallet transactions by the user:");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const userId = req.user?.id;
      console.log(
        "userId in the getwallet transactions in the user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._userService.getAllWalletTransactions({
        page,
        limit,
        userId,
      });

      console.log("response in the getWalletTransactions:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch wallet transactions"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching all the wallet transactions of the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      console.log("Fetching chat history for booking");
      const { bookingId } = req.params;

      const serviceResponse = await this._chatService.getChatHistory(bookingId);

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
              serviceResponse.message || "Failed to fetch chat history"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching chat history:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async sendChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Sending chat message to the technician");
      const userId = req.user?.id;
      const { bookingId } = req.params;
      const { messageText, technicianId } = req.body;
      const io = req.io;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const chatData = {
        userId,
        technicianId,
        bookingId,
        messageText,
        senderType: "user" as const,
      };

      const serviceResponse = await this._chatService.sendChat(chatData);

      if (serviceResponse.success && io && serviceResponse.data) {
        io.to(`booking_${bookingId}`).emit("new_message", serviceResponse.data);
        console.log(`Message broadcasted to booking_${bookingId} room`);
      }
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
              serviceResponse.message || "Failed to send the chat"
            )
          );
      }
    } catch (error) {
      console.log("Error sending chat:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
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

  async getOffers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("fetching the offers for the user");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._offerService.getUserOffers(userId);
      console.log("response in the fetching all offers:", serviceResponse);
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
              serviceResponse.message || "Failed to fetch offers"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching offers:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async applyBestOffer(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      console.log(
        "userId in the applybest offer method in the user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      console.log("received Data:", req.body);

      const { serviceId, totalAmount } = req.body;

      if (!serviceId || !totalAmount) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse("Service ID and total amount are required")
          );
        return;
      }

      const serviceResponse = await this._bookingService.applyBestOffer(
        userId,
        serviceId,
        totalAmount
      );

      console.log(
        "response in applying the best offer in the user controller:",
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
              serviceResponse.message || "Failed to apply best offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while applying best offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getEligibleCoupons(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching eligible coupons for the user");
      const userId = req.user?.id;
      const serviceId = req.query.serviceId as string;

      console.log("serviceId:", serviceId);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      if (!serviceId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Service ID is required"));
        return;
      }

      console.log("userId:", userId);
      console.log("serviceId:", serviceId);

      const serviceResponse = await this._couponService.getEligibleCoupons(
        userId,
        serviceId
      );

      console.log("response in fetching eligible coupons:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch eligible coupons"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching eligible coupons:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async applyCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { couponId, serviceId } = req.body;
      console.log(
        "userId in the apply coupon function in the user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      if (!serviceId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Service ID is required"));
        return;
      }

      if (!couponId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Coupon ID is required"));
        return;
      }
      const serviceResponse = await this._couponService.applyCoupon(
        userId,
        couponId,
        serviceId
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
              serviceResponse.message || "Failed to apply coupon"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching eligible coupons:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getNotifications(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "enetring the user controller function that fetches the all notifications:"
      );
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const notifications =
        await this._notificationService.getNotificationsByUser(userId, "user");

      res
        .status(HTTP_STATUS.OK)
        .json(
          createSuccessResponse(
            notifications,
            "Notifications fetched successfully"
          )
        );
    } catch (error) {
      console.log("error occured while fetching the notifications:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getUnreadNotificationCount(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const unreadCount = await this._notificationService.getUnreadCount(
        userId,
        "user"
      );

      res
        .status(HTTP_STATUS.OK)
        .json(
          createSuccessResponse(
            { unreadCount },
            "Unread count fetched successfully"
          )
        );
    } catch (error) {
      console.log("error occured while fetching unread notifications:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async markNotificationRead(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const updatedNotification =
        await this._notificationService.markNotificationAsRead(notificationId);

      if (updatedNotification) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              updatedNotification,
              "Notification marked as read"
            )
          );
      } else {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createErrorResponse("Notification not found"));
      }
    } catch (error) {
      console.log(
        "error occured while marking all notifications as read:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering the logout function from the user auth controller");
      const role = req.user?.role;
      console.log("role in the user auth controller:", role);
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res
        .status(HTTP_STATUS.OK)
        .json(createSuccessResponse(null, "Logged out successfully"));
    } catch (error) {
      console.log("error occured while user logging out:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }
}

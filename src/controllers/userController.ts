import { IuserController } from "../interfaces/Icontrollers/IuserController";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { IServiceService } from "../interfaces/Iservices/IserviceService";
import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { ItechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { IbookingService } from "../interfaces/Iservices/IbookingService";
import { IchatService } from "../interfaces/Iservices/IchatService";

@injectable()
export class UserController implements IuserController {
  constructor(
    @inject("IuserService") private userService: IuserService,
    @inject("IServiceService") private serviceService: IServiceService,
    @inject("IAddressService") private addressService: IAddressService,
    @inject("ItechnicianService") private technicianService: ItechnicianService,
    @inject("ITimeSlotService") private timeSlotService: ITimeSlotService,
    @inject("IbookingService") private bookingService: IbookingService,
    @inject("IchatService") private chatService: IchatService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the register function in userController");
      const data = req.body;
      console.log("data:", data);
      const response = await this.userService.userSignUp(data);
      console.log("response in register:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempUserId: response.tempUserId,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error occured", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the verify otp function in userController");
      const data = req.body;
      console.log("userData in verifyOtp controller:", data);
      const response = await this.userService.verifyOtp(data);
      console.log("response in verifyOtp controller:", response);
      if (response.success) {
        res.status(response.status).json(response);
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error occured:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the resend otp functionality in the ");
      const { email } = req.body;
      const response = await this.userService.resendOtp(email);
      console.log("response from the resendotp controller:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempuserId: response.tempUserId,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error in the resendOtp controller", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the user login function in usercontroller");
      const data = req.body;
      const response = await this.userService.login(data);

      res.cookie(
        `${response.role?.toLowerCase()}_refresh_token`,
        response.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );

      console.log("response from the login controller", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          data: response,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering forgotPassword function in userController");
      const { email } = req.body;

      const response = await this.userService.forgotPassword({ email });
      console.log("Response from forgotPassword service:", response);

      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("Error in forgotPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering resetPassword function in userController");
      const { email, password } = req.body;

      const response = await this.userService.resetPassword({
        email,
        password,
      });

      console.log("Response from resetPassword service:", response);

      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("Error in resetPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the categories");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.serviceService.getAllCategories({
        page,
        limit,
        search,
      });

      console.log(
        "result from the fetching all categories from the service service:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error occured while fetching the categories:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      console.log("services fetching to be listed in the user side");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const categoryId = req.query.category as string;

      const result = await this.serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
      });

      console.log("result from the services fetching controller:", result);
      res.status(result.status).json(result);
    } catch (error) {
      console.log("error occured while fetching the services:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering user profile fetch");
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Unauthorized access",
          success: false,
          status: HTTP_STATUS.UNAUTHORIZED,
        });
        return;
      }

      const response = await this.userService.getUserProfile(userId);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async editProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the user editing the profile function");
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Unauthorized access",
          success: false,
          status: HTTP_STATUS.UNAUTHORIZED,
        });
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

      const response = await this.userService.editProfile(
        userId,
        profileUpdateData
      );

      console.log("response in the user editing profile function:", response);

      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error in editProfile controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAddress(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the controller for fetchning the user address");
      const userId = (req as any).user?.id;
      console.log("userId from the address fetching controller:", userId);
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "UnAuthorized access",
        });
        return;
      }
      const response = await this.addressService.getUserAddresses(userId);
      console.log(
        "response from the user controller fetchning the user address:",
        response
      );

      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while fetchning the user address:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server error",
      });
    }
  }

  async addAddress(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the user address");
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "UnAuthorized access",
        });
        return;
      }

      const addressData = req.body;

      console.log("address Data received:", req.body);

      const response = await this.addressService.addAddress(
        userId,
        addressData
      );

      console.log("response from the addService service:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while adding new address:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server error",
      });
    }
  }

  async deleteAddress(req: Request, res: Response): Promise<void> {
    try {
      console.log("deleting the already existing address of the user");
      const userId = (req as any).user?.id;
      const addressId = req.params.addressId;
      console.log("userId from the address deleting controller:", userId);
      console.log("addressId from the address deleting controller:", addressId);
      if (!userId && !addressId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "UnAuthorized access",
        });
        return;
      }
      const response = await this.addressService.deleteAddress(
        addressId,
        userId
      );
      console.log(
        "response from the user controller deleting the user address:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while deleting the address:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server error",
      });
    }
  }

  async getServiceDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the service details for the user");
      const serviceId = req.params.serviceId;
      console.log("serviceId in the user controller:", serviceId);
      const response = await this.serviceService.getServiceDetails(serviceId);
      console.log("response in the user controller:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log(
        "error occured while fetching the service details for the user:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
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
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message:
            "Invalid or missing parameters. Required: designationId, longitude (user's), latitude (user's)",
        });
        return;
      }

      const response = await this.technicianService.getNearbyTechnicians(
        designationId,
        userLongitude,
        userLatitude,
        radius
      );

      console.log("response in the user controller:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log(
        "error occurred while fetching the nearby technicians for the user:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log("finding the time slots for the user");
      const technicianId = req.params.technicianId;
      const includePast = req.query.includePast === "true";
      console.log("techncianId in the user controller:", technicianId);

      const userFilters = {
        isAvailable: true,
        isBooked: false,
      };

      const response = await this.timeSlotService.getTimeSlots(
        technicianId,
        includePast,
        userFilters
      );
      console.log(
        "response from the get time slots user controller:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while fetching the time slots for the user");
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server error",
      });
    }
  }

  async bookService(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the user booking the controller function");
      const userId = (req as any).user?.id;
      const data = req.body;
      console.log("Received Data:", data);
      const response = await this.bookingService.bookService(userId, data);
      console.log(
        "response from the user service booking controller:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error ocured while booking the service:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server error",
      });
    }
  }

  async verifyStripeSession(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the verifyStripeSession in the user controller function for booking"
      );

      const userId = (req as any).user?.id;
      const sessionId = req.params.sessionId as string;
      console.log("userId in the stripe verify function:", userId);
      console.log("sessionId in the stripe verify function:", sessionId);

      const result = await this.bookingService.verifyStripeSession(
        sessionId,
        userId
      );

      console.log(
        "result from the veryfying stripe session in user controller:",
        result
      );

      res.status(result.status).json(result);
    } catch (error) {
      console.log("error occured while veryfying the stripe session:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the all bookings fetching for the user");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;

      const response = await this.bookingService.getAllBookings({
        page,
        limit,
      });
      console.log(
        "result from the fetching all bookings for users controller:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.error("Error in getAllBookings controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching Bookings",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getBookingDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Controller: Getting booking details");

      const userId = (req as any).user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!bookingId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Booking ID is required",
        });
        return;
      }

      console.log("Fetching booking details for:", bookingId, "User:", userId);

      const response = await this.bookingService.getBookingById(bookingId, {
        userId: userId,
      });

      res.status(response.status).json(response);
    } catch (error) {
      console.error("Error in getBookingDetails controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async addMoney(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the function which adds the money to the user wallet"
      );
      const userId = (req as any).user?.id;
      const { amount } = req.body;
      console.log("userId in the add money controller:", userId);
      console.log("Received Data:", amount);
      const result = await this.userService.addMoney(userId, amount);
      console.log(
        "result in the usercontroller for adding money in wallet:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.log(
        "error occured in the user controller while adding the money to wallet:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async verifyWalletStripeSession(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the verifyStripeSession in the user controller function for wallet"
      );

      const userId = (req as any).user?.id;
      const sessionId = req.params.sessionId as string;
      console.log("userId in the verify stripe session for wallet:", userId);
      console.log(
        "sessionId in the verify stripe session for wallet:",
        sessionId
      );

      const result = await this.userService.verifyWalletStripeSession(
        sessionId,
        userId
      );

      console.log(
        "result from the veryfying stripe session in user controller:",
        result
      );

      res.status(result.status).json(result);
    } catch (error) {
      console.log("error occured while veryfying the stripe session:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "fetching the wallet balance for the user in the user controller function"
      );
      const userId = (req as any).user?.id;
      console.log(
        "userId in the getWalletBalance function in user controller:",
        userId
      );
      const response = await this.userService.getWalletBalance(userId);
      console.log(
        "response in the user controller for fetching the user wallet balance:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log(
        "error occured while fetching the user wallet balance:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getWalletTransactions(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the wallet transactions by the user:");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const userId = (req as any).user?.id;
      console.log(
        "userId in the getwallet transactions in the user controller:",
        userId
      );
      const response = await this.userService.getAllWalletTransactions({
        page,
        limit,
        userId,
      });

      console.log("response in the getWalletTransactions:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log(
        "error occured while fetching all the wallet transactions of the user:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      console.log("Fetching chat history for booking");
      const { bookingId } = req.params;

      const response = await this.chatService.getChatHistory(bookingId);

      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error fetching chat history:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async sendChat(req: Request, res: Response): Promise<void> {
    try {
      console.log("Sending chat message to the technician");
      const userId = (req as any).user?.id;
      const { bookingId } = req.params;
      const { messageText, technicianId } = req.body;
      const io = (req as any).io;

      const chatData = {
        userId,
        technicianId,
        bookingId,
        messageText,
        senderType: "user" as const,
      };

      const response = await this.chatService.sendChat(chatData);

      if (response.success && io && response.data) {
        io.to(`booking_${bookingId}`).emit("new_message", response.data);
        console.log(`Message broadcasted to booking_${bookingId} room`);
      }
      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error sending chat:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the user controller that cancells the booking");
      const { bookingId } = req.params;
      const userId = (req as any).user?.id;
      const { cancellationReason } = req.body;
      console.log("received Data:", cancellationReason);

      const response = await this.bookingService.cancelBookingByUser(
        userId,
        bookingId,
        cancellationReason
      );

      console.log(
        "response from the booking service after cancelling the booking by user:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while user cancelling the booking:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Servor Error",
        success: false,
      });
    }
  }

  async rateService(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the user controller which rate the services");
      const { bookingId } = req.params;
      const userId = (req as any).user?.id;
      const { rating, review } = req.body;

      console.log("received data:", { bookingId, userId, rating, review });

      const response = await this.bookingService.rateService(
        userId,
        bookingId,
        rating,
        review || ""
      );

      res.status(response.status).json(response);
    } catch (error) {
      console.error("Error in rateService controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the logout function from the user auth controller");
      const role = (req as any).user?.role;
      console.log("role in the user auth controller:", role);
      res.clearCookie(`${role}_refresh_token`, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.log("error occured while user logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }
}

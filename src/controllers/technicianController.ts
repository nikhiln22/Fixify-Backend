import { ITechnicianController } from "../interfaces/Icontrollers/ItechnicianController";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { IJobsService } from "../interfaces/Iservices/IjobsService";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IBookingService } from "../interfaces/Iservices/IbookingService";
import { IChatService } from "../interfaces/Iservices/IchatService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

@injectable()
export class TechnicianController implements ITechnicianController {
  constructor(
    @inject("ITechnicianService")
    private _technicianService: ITechnicianService,
    @inject("IJobsService")
    private _jobsService: IJobsService,
    @inject("ITimeSlotService")
    private _timeSlotService: ITimeSlotService,
    @inject("IBookingService") private _bookingService: IBookingService,
    @inject("IChatService") private _chatService: IChatService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the register function in technicianAuthController"
      );
      const data = req.body;
      console.log("data:", data);

      const serviceResponse = await this._technicianService.technicianSignUp(
        data
      );
      console.log("response in technician register:", serviceResponse);

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.CREATED).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
              tempTechnicianId: serviceResponse.tempTechnicianId,
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
      console.log("error occurred", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering into the verify otp function in technicianAuthController"
      );
      const data = req.body;
      console.log("technicianData in verifyOtp controller:", data);

      const serviceResponse = await this._technicianService.verifyOtp(data);
      console.log(
        "response in verifyOtp controller in technician:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
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
          ? HTTP_STATUS.BAD_REQUEST
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
      console.log("error occurred:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering into the resend otp functionality in the technicianAuthController"
      );
      const { email } = req.body;

      const serviceResponse = await this._technicianService.resendOtp(email);
      console.log(
        "response from the technician resendotp controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
              tempTechnicianId: serviceResponse.tempTechnicianId,
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

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the technician login function in technicianAuthController"
      );
      const data = req.body;

      const serviceResponse = await this._technicianService.login(data);
      console.log(
        "response from the technician login controller",
        serviceResponse
      );

      if (serviceResponse.success) {
        res.cookie(
          `${serviceResponse.role?.toLowerCase()}_refresh_token`,
          serviceResponse.refresh_token,
          {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          }
        );

        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              technician: serviceResponse.technician,
              access_token: serviceResponse.access_token,
              role: serviceResponse.role,
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

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "Entering forgotPassword function in technicianAuthController"
      );
      const { email } = req.body;

      const serviceResponse = await this._technicianService.forgotPassword({
        email,
      });
      console.log(
        "Response from forgotPassword service in technician:",
        serviceResponse
      );

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
      console.log(
        "Entering resetPassword function in technicianAuthController"
      );
      const { email, password } = req.body;

      const serviceResponse = await this._technicianService.resetPassword({
        email,
        password,
      });

      console.log("Response from resetPassword service:", serviceResponse);

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

  async submitQualifications(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("Entering technician qualification submission");
      const data = req.body;
      console.log("Received data:", data);

      const technicianId = req.user?.id;
      console.log("technicianId:", technicianId);

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const qualificationData = {
        experience: req.body.experience,
        designation: req.body.designation,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        address: req.body.address,
        about: req.body.about,
        profilePhoto: files?.profilePhoto?.[0],
        certificates: files?.certificates,
      };

      console.log("Processing qualification data:", qualificationData);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.submitTechnicianQualifications(
          technicianId,
          qualificationData
        );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
              serviceResponse.message
            )
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to submit qualifications"
            )
          );
      }
    } catch (error) {
      console.log("Some error occurred:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Entering technician profile fetch");
      const technicianId = req.user?.id;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getTechnicianProfile(technicianId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
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
              serviceResponse.message || "Failed to fetch profile"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getJobDesignations(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the job designations fetching function from the technician controller"
      );

      const serviceResponse = await this._jobsService.getAllDesignations({});
      console.log(
        "response from the job designations controller:",
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
              serviceResponse.message || "Failed to fetch job designations"
            )
          );
      }
    } catch (error) {
      console.log("error occurred:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }

  async addTimeSlots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "adding the time slots by the technician in time slot function"
      );
      const technicianId = req.user?.id;
      const data = req.body;
      console.log("data in the addtime slot controller:", data);
      console.log("technicianId from the addtimeslot function:", technicianId);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._timeSlotService.addTimeSlots(
        technicianId,
        data
      );
      console.log(
        "response from the technician controller adding time Slots:",
        serviceResponse
      );

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
              serviceResponse.message || "Failed to add time slots"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the time slots:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server error"));
    }
  }

  async getTimeSlots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("fetching the added time slots for the technician");
      const technicianId = req.user?.id;
      const includePast = req.query.includePast === "true";
      console.log(
        "technicianId from the getTimeSlots function in technician controller:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._timeSlotService.getTimeSlots(
        technicianId,
        includePast
      );
      console.log(
        "response from the technician controller getting time slots:",
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
        "error occurred while fetching the time slots for the controller:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server error"));
    }
  }

  async blockTimeSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the technician controller function that makes the released slots unavailable"
      );
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the blocktime slots function:",
        technicianId
      );
      const slotId = req.params.slotId;
      console.log("slotId in the blocktime slots function:", slotId);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._timeSlotService.blockTimeSlot(
        technicianId,
        slotId
      );
      console.log("response from the blockslotId Service:", serviceResponse);

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
              serviceResponse.message || "Failed to block time slot"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the slots:", error);
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
      console.log(
        "entering to the technician controller which fetches all the bookings for the technician"
      );
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const filter = (req.query.filter as string) || undefined;

      const technicianId = req.user?.id;
      console.log(
        "technicianId in the fetching booking in the technician controller:",
        technicianId
      );
      console.log("filter in technician controller:", filter);

      const serviceResponse = await this._bookingService.getAllBookings({
        page,
        limit,
        technicianId,
        search,
        filter,
        role: "technician",
      });
      console.log("result from the booking service:", serviceResponse);

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
      console.error(
        "Error in getAllBookings for technician controller:",
        error
      );
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
      console.log("technician Controller: Getting booking details");

      const technicianId = req.user?.id;
      console.log(
        "technicianId in the fetching booking details in the technician controller:",
        technicianId
      );
      const { bookingId } = req.params;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      if (!bookingId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Booking ID is required"));
        return;
      }

      console.log(
        "Fetching booking details for:",
        bookingId,
        "technician:",
        technicianId
      );

      const serviceResponse = await this._bookingService.getBookingById(
        bookingId,
        {
          technicianId: technicianId,
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
      console.log("Sending chat message to the user");
      const technicianId = req.user?.id;
      const { bookingId } = req.params;
      const { messageText, userId } = req.body;
      const io = req.io;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const chatData = {
        userId,
        technicianId,
        bookingId,
        messageText,
        senderType: "technician" as const,
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

  async generateCompletionOtp(
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

  async verifyCompletionOtp(
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
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(serviceResponse.message));
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

  async getWalletBalance(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the wallet balance for the technician in the technician controller function"
      );
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the getWalletBalance function in technician controller:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse = await this._technicianService.getWalletBalance(
        technicianId
      );
      console.log(
        "response in the technician controller for fetching the technician wallet balance:",
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
        "error occurred while fetching the technician wallet balance:",
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
      console.log("fetching the wallet transactions by the technician:");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the getwallet transactions in the technician controller:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getAllWalletTransactions({
          page,
          limit,
          technicianId,
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
        "error occurred while fetching all the wallet transactions of the technician:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async cancelBooking(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the technician controller fetching the reviews:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse = await this._technicianService.getReviews(
        technicianId
      );
      console.log(
        "response from the service fetching the technician reviews:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              reviews: serviceResponse.reviews,
              averageRating: serviceResponse.averageRating,
              totalReviews: serviceResponse.totalReviews,
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
              serviceResponse.message || "Failed to fetch reviews"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the technician reviews:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getRating(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entered the function which fetched the booking rating for a specified booking in technician controller"
      );
      const { bookingId } = req.params;
      console.log("bookingId in the technician controller:", bookingId);

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

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the logout function from the technician auth controller"
      );
      const role = req.user?.role;
      console.log("role in the technician auth controller:", role);

      res.clearCookie(`${role}_refresh_token`, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json(createSuccessResponse(null, "Logged out successfully"));
    } catch (error) {
      console.log("error occurred while technician logging out:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }
}

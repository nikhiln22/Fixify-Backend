import { ItechnicianController } from "../interfaces/Icontrollers/ItechnicianController";
import { ItechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { IjobsService } from "../interfaces/Iservices/IjobsService";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IbookingService } from "../interfaces/Iservices/IbookingService";

@injectable()
export class TechnicianController implements ItechnicianController {
  constructor(
    @inject("ItechnicianService")
    private technicianService: ItechnicianService,
    @inject("IjobsService")
    private jobsService: IjobsService,
    @inject("ITimeSlotService")
    private timeSlotService: ITimeSlotService,
    @inject("IbookingService") private bookingService: IbookingService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the register function in technicianAuthController"
      );
      const data = req.body;
      console.log("data:", data);
      const response = await this.technicianService.technicianSignUp(data);
      console.log("response in technician register:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempTechnicianId: response.tempTechnicianId,
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
      console.log(
        "entering into the verify otp function in technicianAuthController"
      );
      const data = req.body;
      console.log("technicianData in verifyOtp controller:", data);
      const response = await this.technicianService.verifyOtp(data);
      console.log("response in verifyOtp controller in technician:", response);
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
      console.log(
        "entering into the resend otp functionality in the technicianAuthController"
      );
      const { email } = req.body;
      const response = await this.technicianService.resendOtp(email);
      console.log(
        "response from the technician resendotp controller:",
        response
      );
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempTechnicianId: response.tempTechnicianId,
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
      console.log(
        "entering the user login function in technicianAuthController"
      );
      const data = req.body;
      const response = await this.technicianService.login(data);
      console.log("response from the technician login controller", response);

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
      console.log(
        "Entering forgotPassword function in technicianAuthController"
      );
      const { email } = req.body;

      const response = await this.technicianService.forgotPassword({
        email,
      });
      console.log(
        "Response from forgotPassword service in technician:",
        response
      );

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
      console.log(
        "Entering resetPassword function in technicianAuthController"
      );
      const { email, password } = req.body;

      const response = await this.technicianService.resetPassword({
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

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the logout function from the technician auth controller"
      );
      const role = (req as any).user?.role;
      console.log("role in the technician auth controller:", role);
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
      console.log("error occured while technician logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }

  async submitQualifications(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering technician qualification submission");
      const data = req.body;
      console.log("Received data:", data);

      const technicianId = (req as any).user?.id;

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

      const response =
        await this.technicianService.submitTechnicianQualifications(
          technicianId,
          qualificationData
        );

      res.status(response.status).json(response);
    } catch (error) {
      console.log("Some error occurred:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering technician profile fetch");
      const technicianId = (req as any).user?.id;

      if (!technicianId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Unauthorized access",
          success: false,
          status: HTTP_STATUS.UNAUTHORIZED,
        });
        return;
      }

      const response = await this.technicianService.getTechnicianProfile(
        technicianId
      );
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

  async getJobDesignations(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the job designations fetching function from the technician controller"
      );

      let response = await this.jobsService.getAllDesignations({});
      console.log("respone from the job designations controller:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error occured" });
    }
  }

  async addTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "adding the time slots by the technician in time slot function"
      );
      const technicianId = (req as any).user?.id;
      const data = req.body;
      console.log("data in the addtime slot controller:", data);
      console.log("technicianId from the addtimeslot function:", technicianId);
      const response = await this.timeSlotService.addTimeSlots(
        technicianId,
        data
      );
      console.log(
        "response from the technician controller adding time Slots:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while adding the time slots:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server error",
      });
    }
  }

  async getTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the added time slots for the technician");
      const technicianId = (req as any).user?.id;
      const includePast = req.query.includePast === "true";
      console.log(
        "technicianId from the getTimeSlots function in technician controller:",
        technicianId
      );
      const response = await this.timeSlotService.getTimeSlots(
        technicianId,
        includePast
      );
      console.log(
        "response from the technician controller getting time slots:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log(
        "error occured while fetching the time slots for the controller:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server error",
      });
    }
  }

  async blockTimeSlot(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the technician controller function that makes the released slots unavailable"
      );
      const technicianId = (req as any).user?.id;
      console.log(
        "technicianId in the blocktime slots function:",
        technicianId
      );
      const slotId = req.params.slotId;
      console.log("slotId in the blocktime slots function:", slotId);
      const response = await this.timeSlotService.blockTimeSlot(
        technicianId,
        slotId
      );
      console.log("response from the blockslotId Service:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while blocking the slots:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the technician controller which fetches all the bookings for the technician"
      );
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const technicianId = (req as any).user?.id;
      console.log(
        "technicianId in the fetching booking in the technician controller:",
        technicianId
      );
      const response = await this.bookingService.getAllBookings({
        technicianId,
        page,
        limit,
      });
      console.log("result from the technician service:", response);

      res.status(response.status).json(response);
    } catch (error) {
      console.error(
        "Error in getAllBookings for technician controller:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching Bookings",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getBookingDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("technician Controller: Getting booking details");

      const technicianId = (req as any).user?.id;
      console.log(
        "technicianId in the fetching booking details in the technician controller:",
        technicianId
      );
      const { bookingId } = req.params;

      if (!technicianId) {
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

      console.log(
        "Fetching booking details for:",
        bookingId,
        "technician:",
        technicianId
      );

      const response = await this.bookingService.getBookingById(bookingId, {
        technicianId: technicianId,
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
}

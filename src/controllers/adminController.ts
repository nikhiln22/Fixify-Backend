import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IadminController } from "../interfaces/Icontrollers/IadminController";
import { inject, injectable } from "tsyringe";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { IadminService } from "../interfaces/Iservices/IadminService";
import { ItechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { IbookingService } from "../interfaces/Iservices/IbookingService";

@injectable()
export class AdminController implements IadminController {
  constructor(
    @inject("IuserService")
    private userService: IuserService,
    @inject("IadminService")
    private adminService: IadminService,
    @inject("ItechnicianService")
    private technicianService: ItechnicianService,
    @inject("IbookingService") private bookingService: IbookingService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin controller function fro admin login");
      const data = req.body;
      console.log("data:", data);
      const response = await this.adminService.adminLogin(data);
      console.log("response from the admin login controller:", response);

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
      console.log("error occured while logging the admin:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await this.userService.getAllUsers({
        page,
        limit,
        search,
        status,
      });

      console.log("result from the fetching all users controller:", result);
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const response = await this.userService.toggleUserStatus(id);

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }

  async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the applicants");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;

      const result = await this.technicianService.getAllApplicants({
        page,
        limit,
      });

      console.log(
        "result from the fetching all applicants from admin controller:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.error(
        "Error in fetching all applicants in admin controller:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching Applicants",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async verifyApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entered verify applicant function in admin controller");
      const applicantId = req.params.applicantId;
      console.log(
        "Applicant ID from verify applicant controller:",
        applicantId
      );

      const response = await this.technicianService.verifyTechnician(
        applicantId
      );
      console.log("Response from verifying the applicant:", response);

      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error occurred while verifying the applicant:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async rejectApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entered reject applicant function in admin controller");
      const applicantId = req.params.applicantId;
      const { reason } = req.body;

      console.log(
        "Applicant ID from reject applicant controller:",
        applicantId
      );
      console.log("Rejection reason:", reason);

      const response = await this.technicianService.rejectTechnician(
        applicantId,
        reason
      );
      console.log("Response from rejecting the applicant:", response);

      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error occurred while rejecting the applicant:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getTechnicianProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the technician profile from the admin controller");
      const technicianId = req.params.technicianId;
      console.log("technicianId from the admin controller:", technicianId);
      const response = await this.technicianService.getTechnicianProfile(
        technicianId
      );
      console.log("response from the technician profile:", response);
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

  async getAllTechnicians(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching all the technicians from the admin controller");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const designation = (req.query.designation as string) || undefined;

      const result = await this.technicianService.getAllTechnicians({
        page,
        limit,
        search,
        status,
        designation,
      });

      console.log(
        "result from the fetching all technicians from admin controller:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.error(
        "Error in getting all technician from admin controller:",
        error
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleTechnicianStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const response = await this.technicianService.toggleTechnicianStatus(id);

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.error("Error in toggleTechnicianStatus controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }

async getAllBookings(req: Request, res: Response): Promise<void> {
  try {
    console.log("fetching all the bookings from the admin controller");
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    const search = (req.query.search as string) || undefined;
    const filter = (req.query.filter as string) || undefined;
    
    console.log("filter status in the admin controller:", filter);
    
    const result = await this.bookingService.getAllBookings({
      page,
      limit,
      search,
      filter,
      role: 'admin'
    });
    
    res.status(HTTP_STATUS.OK).json(result);
    console.log(
      "result from fetching all the bookings for the admin controller:",
      result
    );
  } catch (error) {
    console.log("error occured while fetchning the bookings for the admin");
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
}

  async getBookingDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Controller: Getting booking details");

      const { bookingId } = req.params;

      if (!bookingId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Booking ID is required",
        });
        return;
      }

      console.log("Fetching booking details for admin:", bookingId);

      const response = await this.bookingService.getBookingById(bookingId, {});

      res.status(response.status).json(response);
    } catch (error) {
      console.error("Error in getBookingDetails controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the logout function from the admin auth controller"
      );
      const role = (req as any).user?.role;
      console.log("role in the admin auth controller:", role);
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
      console.log("error occured while admin logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }
}

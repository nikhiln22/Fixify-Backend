import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IadminController } from "../interfaces/Icontrollers/IadminController";
import { inject, injectable } from "tsyringe";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { IadminService } from "../interfaces/Iservices/IadminService";
import { ItechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { IbookingService } from "../interfaces/Iservices/IbookingService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { ICouponService } from "../interfaces/Iservices/IcouponService";

@injectable()
export class AdminController implements IadminController {
  constructor(
    @inject("IuserService")
    private userService: IuserService,
    @inject("IadminService")
    private adminService: IadminService,
    @inject("ItechnicianService")
    private technicianService: ItechnicianService,
    @inject("IbookingService") private bookingService: IbookingService,
    @inject("IOfferService") private offerService: IOfferService,
    @inject("ICouponService") private couponService: ICouponService
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
        role: "admin",
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

  async addOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the offer controller function that adds the offer"
      );
      console.log("received Data:", req.body);

      const offerData = {
        title: req.body.title,
        description: req.body.description,
        offer_type: req.body.offer_type,
        discount_type: req.body.discount_type,
        discount_value: req.body.discount_value,
        max_discount: req.body.max_discount,
        min_booking_amount: req.body.min_booking_amount,
        service_id: req.body.service_id,
        valid_until: req.body.valid_until
          ? new Date(req.body.valid_until)
          : undefined,
      };

      console.log("processed offer data:", offerData);

      const response = await this.offerService.addOffer(offerData);

      res.status(response.status).json(response);
    } catch (error) {
      console.error("Error in addOffer controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the offers for the admin");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const filterStatus = (req.query.filterStatus as string) || undefined;
      console.log("filterStatus in adminController:", filterStatus);
      const response = await this.offerService.getAllOffers({
        page,
        limit,
        search,
        filterStatus,
      });
      console.log("response in the fetching all offers:", response);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async blockOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the block offer function in the admin controller"
      );
      const { id } = req.params;
      console.log("offerId in the block offer function:", id);
      const response = await this.offerService.blockOffer(id);
      console.log("response from the block offer function:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while blocking the offer:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log("updating the existing offer from the admin controller:");
      const offerId = req.params.offerId;
      console.log("offerId:", offerId);
      if (!offerId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Offer ID is required",
        });
        return;
      }

      console.log("req.body:", req.body);

      const {
        title,
        description,
        offer_type,
        discount_type,
        discount_value,
        max_discount,
        min_booking_amount,
        service_id,
        valid_until,
      } = req.body;

      console.log("offer_type:", offer_type);

      const updateData: {
        title?: string;
        description?: string;
        offer_type?: string;
        discount_type?: number;
        discount_value?: number;
        max_discount?: number;
        min_booking_amount?: number;
        service_id?: string;
        valid_until?: Date;
      } = {};

      if (title !== undefined) {
        updateData.title = title;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (offer_type !== undefined) {
        updateData.offer_type = offer_type;
      }

      if (discount_type !== undefined) {
        updateData.discount_type = discount_type;
      }

      if (discount_value !== undefined) {
        updateData.discount_value = discount_value;
      }

      if (max_discount !== undefined) {
        updateData.max_discount = max_discount;
      }

      if (min_booking_amount !== undefined) {
        updateData.min_booking_amount = min_booking_amount;
      }

      if (service_id !== undefined) {
        updateData.service_id = service_id;
      }

      if (valid_until !== undefined) {
        updateData.valid_until = valid_until;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const response = await this.offerService.updateOffer(offerId, updateData);
      console.log("after updating the offer from the offer service:", response);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while updating the offer:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async addCoupon(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the add coupon function in the admin controller"
      );
      console.log("received Data:", req.body);

      const couponData = {
        code: req.body.code,
        title: req.body.title,
        description: req.body.description,
        discount_type: req.body.discount_type,
        discount_value: req.body.discount_value,
        max_discount: req.body.max_discount,
        min_booking_amount: req.body.min_booking_amount,
        valid_until: req.body.valid_until
          ? new Date(req.body.valid_until)
          : undefined,
      };

      console.log("processed offer data:", couponData);

      const response = await this.couponService.addCoupon(couponData);

      console.log(
        "response after adding the coupon in admin controller:",
        response
      );

      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured while adding the coupon:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the coupons for the admin");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const filterStatus = (req.query.filter as string) || undefined;
      const response = await this.couponService.getAllCoupons({
        page,
        limit,
        search,
        filterStatus,
      });
      console.log("response in the fetching all coupons:", response);
      res.status(response.status).json(response);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
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

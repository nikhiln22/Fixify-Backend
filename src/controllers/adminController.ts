import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IAdminController } from "../interfaces/Icontrollers/IadminController";
import { inject, injectable } from "tsyringe";
import { IUserService } from "../interfaces/Iservices/IuserService";
import { IAdminService } from "../interfaces/Iservices/IadminService";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { IBookingService } from "../interfaces/Iservices/IbookingService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { ICouponService } from "../interfaces/Iservices/IcouponService";
import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import config from "../config/env";
import { INotificationService } from "../interfaces/Iservices/InotificationService";

@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject("IUserService")
    private _userService: IUserService,
    @inject("IAdminService")
    private _adminService: IAdminService,
    @inject("ITechnicianService")
    private _technicianService: ITechnicianService,
    @inject("IBookingService") private _bookingService: IBookingService,
    @inject("IOfferService") private _offerService: IOfferService,
    @inject("ICouponService") private _couponService: ICouponService,
    @inject("ISubscriptionPlanService")
    private _subscriptionPlanService: ISubscriptionPlanService,
    @inject("INotificationService")
    private _notificationService: INotificationService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin controller function for admin login");
      const data = req.body;
      console.log("data:", data);

      const serviceResponse = await this._adminService.adminLogin(data);
      console.log("response from the admin login controller:", serviceResponse);

      if (serviceResponse.success) {
        res.cookie("refresh_token", serviceResponse.refresh_token, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite:
            config.NODE_ENV === "production"
              ? ("strict" as const)
              : ("lax" as const),
          maxAge: config.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              admin: serviceResponse.data,
              access_token: serviceResponse.access_token,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("invalid")
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(createErrorResponse(serviceResponse.message || "Login failed"));
      }
    } catch (error) {
      console.log("error occurred while logging the admin:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.page
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;

      const serviceResponse = await this._userService.getAllUsers({
        page,
        limit,
        search,
        status,
      });

      console.log(
        "result from the fetching all users controller:",
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
              serviceResponse.message || "Failed to fetch users"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceResponse = await this._userService.toggleUserStatus(id);

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
              serviceResponse.message || "Failed to toggle user status"
            )
          );
      }
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the applicants");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const serviceResponse = await this._technicianService.getAllApplicants({
        page,
        limit,
      });

      console.log(
        "result from the fetching all applicants from admin controller:",
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
              serviceResponse.message || "Failed to fetch applicants"
            )
          );
      }
    } catch (error) {
      console.error(
        "Error in fetching all applicants in admin controller:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching applicants"));
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

      const serviceResponse = await this._technicianService.verifyTechnician(
        applicantId
      );
      console.log("Response from verifying the applicant:", serviceResponse);

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
              serviceResponse.message || "Failed to verify applicant"
            )
          );
      }
    } catch (error) {
      console.log("Error occurred while verifying the applicant:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
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

      const serviceResponse = await this._technicianService.rejectTechnician(
        applicantId,
        reason
      );
      console.log("Response from rejecting the applicant:", serviceResponse);

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
              serviceResponse.message || "Failed to reject applicant"
            )
          );
      }
    } catch (error) {
      console.log("Error occurred while rejecting the applicant:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getTechnicianProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the technician profile from the admin controller");
      const technicianId = req.params.technicianId;
      console.log("technicianId from the admin controller:", technicianId);

      const serviceResponse =
        await this._technicianService.getTechnicianProfile(technicianId);
      console.log("response from the technician profile:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch technician profile"
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

  async getAllTechnicians(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching all the technicians from the admin controller");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;
      const designation = req.query.designation
        ? (req.query.designation as string)
        : undefined;

      const serviceResponse = await this._technicianService.getAllTechnicians({
        page,
        limit,
        search,
        status,
        designation,
      });

      console.log(
        "result from the fetching all technicians from admin controller:",
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
              serviceResponse.message || "Failed to fetch technicians"
            )
          );
      }
    } catch (error) {
      console.error(
        "Error in getting all technician from admin controller:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching technicians"));
    }
  }

  async toggleTechnicianStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const serviceResponse =
        await this._technicianService.toggleTechnicianStatus(id);

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
              serviceResponse.message || "Failed to toggle technician status"
            )
          );
      }
    } catch (error) {
      console.error("Error in toggleTechnicianStatus controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
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

      const serviceResponse = await this._bookingService.getAllBookings({
        page,
        limit,
        search,
        filter,
        role: "admin",
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
        serviceId: req.body.serviceId,
        valid_until: req.body.valid_until
          ? new Date(req.body.valid_until)
          : undefined,
      };

      console.log("processed offer data:", offerData);

      const serviceResponse = await this._offerService.addOffer(offerData);

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
              serviceResponse.message || "Failed to add offer"
            )
          );
      }
    } catch (error) {
      console.error("Error in addOffer controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the offers for the admin");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const filterStatus = req.query.filterStatus
        ? (req.query.filterStatus as string)
        : undefined;

      const serviceResponse = await this._offerService.getAllOffers({
        page,
        limit,
        search,
        filterStatus,
      });
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

  async blockOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the block offer function in the admin controller"
      );
      const { id } = req.params;
      console.log("offerId in the block offer function:", id);

      const serviceResponse = await this._offerService.blockOffer(id);
      console.log("response from the block offer function:", serviceResponse);

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
              serviceResponse.message || "Failed to block offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log("updating the existing offer from the admin controller:");
      const offerId = req.params.offerId;
      console.log("offerId:", offerId);

      if (!offerId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Offer ID is required"));
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
        serviceId,
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
        serviceId?: string;
        valid_until?: Date;
      } = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (offer_type !== undefined) updateData.offer_type = offer_type;
      if (discount_type !== undefined) updateData.discount_type = discount_type;
      if (discount_value !== undefined)
        updateData.discount_value = discount_value;
      if (max_discount !== undefined) updateData.max_discount = max_discount;
      if (min_booking_amount !== undefined)
        updateData.min_booking_amount = min_booking_amount;
      if (serviceId !== undefined) updateData.serviceId = serviceId;
      if (valid_until !== undefined) updateData.valid_until = valid_until;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._offerService.updateOffer(
        offerId,
        updateData
      );
      console.log(
        "after updating the offer from the offer service:",
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
              serviceResponse.message || "Failed to update offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while updating the offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
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

      console.log("processed coupon data:", couponData);

      const serviceResponse = await this._couponService.addCoupon(couponData);
      console.log(
        "response after adding the coupon in admin controller:",
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
              serviceResponse.message || "Failed to add coupon"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the coupon:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllCoupons(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the coupons for the admin");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const filterStatus = req.query.filterStatus
        ? (req.query.filterStatus as string)
        : undefined;

      const serviceResponse = await this._couponService.getAllCoupons({
        page,
        limit,
        search,
        filterStatus,
      });
      console.log("response in the fetching all coupons:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch coupons"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching coupons:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async blockCoupon(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the block coupon function in the admin controller"
      );
      const { id } = req.params;
      console.log("couponId in the block coupon function:", id);

      const serviceResponse = await this._couponService.blockCoupon(id);
      console.log("response from the block coupon function:", serviceResponse);

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
              serviceResponse.message || "Failed to block coupon"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the coupon:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async updateCoupon(req: Request, res: Response): Promise<void> {
    try {
      console.log("updating the existing coupon from the admin controller:");
      const couponId = req.params.couponId;
      console.log("couponId:", couponId);

      if (!couponId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Coupon ID is required"));
        return;
      }

      console.log("req.body:", req.body);

      const {
        code,
        title,
        description,
        discount_type,
        discount_value,
        max_discount,
        min_booking_amount,
        valid_until,
      } = req.body;

      const updateData: {
        code?: string;
        title?: string;
        description?: string;
        discount_type?: number;
        discount_value?: number;
        max_discount?: number;
        min_booking_amount?: number;
        valid_until?: Date;
      } = {};

      if (code !== undefined) updateData.code = code;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (discount_type !== undefined) updateData.discount_type = discount_type;
      if (discount_value !== undefined)
        updateData.discount_value = discount_value;
      if (max_discount !== undefined) updateData.max_discount = max_discount;
      if (min_booking_amount !== undefined)
        updateData.min_booking_amount = min_booking_amount;
      if (valid_until !== undefined) updateData.valid_until = valid_until;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._couponService.updateCoupon(
        couponId,
        updateData
      );
      console.log(
        "after updating the coupon from the coupon service:",
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
              serviceResponse.message || "Failed to update coupon"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while updating the coupon:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getRating(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entered the function which fetched the booking rating for a specified booking"
      );
      const { bookingId } = req.params;
      console.log("bookingId in the admin controller:", bookingId);

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

  async addSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the subscription plan");
      console.log("Received Data:", req.body);

      const {
        planName,
        commissionRate,
        price,
        WalletCreditDelay,
        profileBoost,
        durationInMonths,
        description,
      } = req.body;

      if (
        !planName ||
        commissionRate === undefined ||
        price === undefined ||
        WalletCreditDelay === undefined ||
        profileBoost === undefined ||
        durationInMonths === undefined
      ) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              "planName, commissionRate, monthlyPrice, WalletCreditDelay, profileBoost, and durationInMonths are required"
            )
          );
        return;
      }

      if (
        typeof commissionRate !== "number" ||
        typeof price !== "number" ||
        typeof WalletCreditDelay !== "number" ||
        typeof durationInMonths !== "number"
      ) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              "Invalid data types: commissionRate, monthlyPrice, WalletCreditDelay, and durationInMonths must be numbers"
            )
          );
        return;
      }

      if (typeof profileBoost !== "boolean") {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("profileBoost must be boolean"));
        return;
      }

      if (commissionRate < 0 || commissionRate > 100) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse("commissionRate must be between 0 and 100")
          );
        return;
      }

      if (price < 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("monthlyPrice cannot be negative"));
        return;
      }

      if (WalletCreditDelay < 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("WalletCreditDelay cannot be negative"));
        return;
      }

      if (durationInMonths < 1) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("durationInMonths must be at least 1"));
        return;
      }

      const subscriptionPlanData = {
        planName,
        commissionRate,
        price,
        WalletCreditDelay,
        profileBoost,
        durationInMonths,
        description: description || undefined,
      };

      console.log("Processed subscription plan data:", subscriptionPlanData);

      const serviceResponse =
        await this._subscriptionPlanService.addSubscriptionPlan(
          subscriptionPlanData
        );

      console.log("Service response:", serviceResponse);

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
              serviceResponse.message || "Failed to add subscription plan"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllSubscriptionPlans(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the subscription plans for the admin");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const filterStatus = req.query.filterStatus
        ? (req.query.filterStatus as string)
        : undefined;

      const serviceResponse =
        await this._subscriptionPlanService.getAllSubscriptionPlans({
          page,
          limit,
          search,
          filterStatus,
        });
      console.log(
        "response in the fetching all Subscription Plans:",
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
              serviceResponse.message || "Failed to fetch Subscription Plans"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching subscription plans:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async updateSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "updating the existing subscription plan from the admin controller:"
      );
      const subscriptionPlanId = req.params.subscriptionPlanId;
      console.log("subscriptionPlanId:", subscriptionPlanId);

      if (!subscriptionPlanId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Subscription Plan ID is required"));
        return;
      }

      console.log("req.body:", req.body);

      const {
        planName,
        commissionRate,
        price,
        WalletCreditDelay,
        profileBoost,
        durationInMonths,
        description,
      } = req.body;

      const updateData: {
        planName?: string;
        commissionRate?: number;
        price?: number;
        WalletCreditDelay?: number;
        profileBoost?: boolean;
        durationInMonths?: number;
        description?: string;
      } = {};

      if (planName !== undefined) updateData.planName = planName;
      if (commissionRate !== undefined)
        updateData.commissionRate = commissionRate;
      if (price !== undefined) updateData.price = price;
      if (WalletCreditDelay !== undefined)
        updateData.WalletCreditDelay = WalletCreditDelay;
      if (profileBoost !== undefined) updateData.profileBoost = profileBoost;
      if (durationInMonths !== undefined)
        updateData.durationInMonths = durationInMonths;
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      if (updateData.commissionRate !== undefined) {
        if (
          typeof updateData.commissionRate !== "number" ||
          updateData.commissionRate < 0 ||
          updateData.commissionRate > 100
        ) {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(
              createErrorResponse(
                "commissionRate must be a number between 0 and 100"
              )
            );
          return;
        }
      }

      if (updateData.price !== undefined) {
        if (typeof updateData.price !== "number" || updateData.price < 0) {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(createErrorResponse("price must be a non-negative number"));
          return;
        }
      }

      if (updateData.WalletCreditDelay !== undefined) {
        if (
          typeof updateData.WalletCreditDelay !== "number" ||
          updateData.WalletCreditDelay < 0
        ) {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(
              createErrorResponse(
                "WalletCreditDelay must be a non-negative number"
              )
            );
          return;
        }
      }

      if (updateData.durationInMonths !== undefined) {
        if (
          typeof updateData.durationInMonths !== "number" ||
          updateData.durationInMonths < 0
        ) {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(
              createErrorResponse(
                "durationInMonths must be a non-negative number"
              )
            );
          return;
        }
      }

      if (updateData.profileBoost !== undefined) {
        if (typeof updateData.profileBoost !== "boolean") {
          res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json(createErrorResponse("profileBoost must be a boolean"));
          return;
        }
      }

      const serviceResponse =
        await this._subscriptionPlanService.updateSubscriptionPlan(
          subscriptionPlanId,
          updateData
        );
      console.log(
        "after updating the subscription plan from the subscription plan service:",
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
              serviceResponse.message || "Failed to update subscription plan"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while updating the subscription plan:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async blockSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the block subscription plan function in the admin controller"
      );
      const { id } = req.params;
      console.log("subscriptionPlanId in the block Subscription plan:", id);

      const serviceResponse =
        await this._subscriptionPlanService.blockSubscriptionPlan(id);
      console.log("response from the block coupon function:", serviceResponse);

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
              serviceResponse.message || "Failed to block coupon"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the coupon:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getSubscriptionhistory(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the technician subscription history for the admin");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const filterStatus = (req.query.filterStatus as string) || undefined;

      const serviceResponse =
        await this._subscriptionPlanService.getSubscriptionHistory({
          page,
          limit,
          search,
          filterStatus,
        });

      console.log(
        "response in the fetching technician Subscription history:",
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
              serviceResponse.message ||
                "Failed to fetch technician Subscription History"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching subscription history:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entered to the admin controller function that fetches dashboard stats"
      );
      const activeUsers = await this._userService.countActiveUsers();
      console.log("total Active users:", activeUsers);
      const activeTechnicians =
        await this._technicianService.countActiveTechnicians();
      console.log("activeTechnicians:", activeTechnicians);
      const totalBookingsCount = await this._bookingService.totalBookings();
      console.log("totalBookingsCount:", totalBookingsCount);

      const totalRevenue = await this._bookingService.getTotalRevenue();

      const dashboardStats = {
        totalRevenue: totalRevenue,
        totalBookings: totalBookingsCount,
        activeTechnicians: activeTechnicians,
        totalCustomers: activeUsers,
      };

      console.log("fetched dashboardstats:", dashboardStats);

      res
        .status(HTTP_STATUS.OK)
        .json(
          createSuccessResponse(
            dashboardStats,
            "Dashboard stats fetched successfully"
          )
        );
    } catch (error) {
      console.log("error occurred while fetching dashboard stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching dashboard stats"));
    }
  }

  async getBookingStatusDistribution(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching booking status distribution in admin controller");

      const serviceResponse =
        await this._bookingService.getBookingStatusDistribution();

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
              serviceResponse.message ||
                "Failed to fetch booking status distribution"
            )
          );
      }
    } catch (error) {
      console.log("error in getBookingStatusDistribution controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getRevenueTrends(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the revenue trends for the admin controller:");

      const days = parseInt(req.query.days as string) || 30;
      console.log("days parameter:", days);

      const serviceResponse = await this._bookingService.getRevenueTrends(days);

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
              serviceResponse.message || "Failed to fetch revenue trends"
            )
          );
      }
    } catch (error) {
      console.log("error in getRevenueTrends controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getServiceCategoryPerformance(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching service category performance in admin controller");

      const limit = parseInt(req.query.limit as string) || 10;
      const days = parseInt(req.query.days as string) || 30;

      const serviceResponse =
        await this._bookingService.getServiceCategoryPerformance(limit, days);

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
              serviceResponse.message ||
                "Failed to fetch service category performance"
            )
          );
      }
    } catch (error) {
      console.log("error in getServiceCategoryPerformance controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getTechnicianReviews(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the admin controller that fetches the technician reviews"
      );
      const { technicianId } = req.query;
      console.log(
        "technicianId in the get technician reviews function in admin controller:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              "technicianId is required and must be a valid string"
            )
          );
        return;
      }

      const serviceResponse = await this._technicianService.getReviews(
        technicianId.toString()
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
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message ||
                "Failed to fetch the technician reviews"
            )
          );
      }
    } catch (error) {
      console.log("error in getServiceCategoryPerformance controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
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
      const adminId = req.user?.id;

      if (!adminId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("admin not authenticated"));
        return;
      }

      const notifications =
        await this._notificationService.getNotificationsByUser(
          adminId,
          "admin"
        );

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
      const adminId = req.user?.id;

      if (!adminId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("admin not authenticated"));
        return;
      }

      const unreadCount = await this._notificationService.getUnreadCount(
        adminId,
        "admin"
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
      const adminId = req.user?.id;
      const { notificationId } = req.params;

      if (!adminId) {
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
      console.log(
        "entering the logout function from the admin auth controller"
      );
      const role = req.user?.role;
      console.log("role in the admin auth controller:", role);

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json(createSuccessResponse(null, "Logged out successfully"));
    } catch (error) {
      console.log("error occurred while admin logging out:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }
}

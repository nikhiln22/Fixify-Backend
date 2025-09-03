import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
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
export class AdminController {
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

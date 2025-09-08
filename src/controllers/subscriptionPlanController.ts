import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

@injectable()
export class SubscriptionPlanController {
  constructor(
    @inject("ISubscriptionPlanService")
    private _subscriptionPlanService: ISubscriptionPlanService
  ) {}

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

  async getSubscriptionHistory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching the subscription history for the technicians");
      const technicianId = req.user?.id;

      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician ID is required"));
        return;
      }

      const serviceResponse =
        await this._subscriptionPlanService.getSubscriptionHistory({
          page,
          limit,
          technicianId,
        });
      console.log(
        "serviceResponse from the subscription service",
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
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createErrorResponse(serviceResponse.message));
      }
    } catch (error) {
      console.log(
        "error occured while fetching the subscription history for technician:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async purchaseSubscriptionPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entered to the technician controller that purchases the subsciption plan"
      );
      const technicianId = req.user?.id;
      const { planId } = req.body;
      console.log(
        "technicianId in the purchase subscription plan controller:",
        technicianId
      );
      console.log(
        "planId in the purchase subscription plan technician controller:",
        planId
      );
      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician ID is required"));
        return;
      }
      const serviceResponse =
        await this._subscriptionPlanService.purchaseSubscriptionPlan(
          technicianId,
          planId
        );

      console.log(
        "service response in the purchase subscription plan controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.data,
              serviceResponse.message || "Checkout session created successfully"
            )
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to create checkout session"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occured while purchasing the subscription plan:",
        error
      );
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
      const sessionId = req.params.sessionId as string;
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the stripe verify function in technician controller:",
        technicianId
      );
      console.log(
        "sessionId in the stripe verify function technician controller:",
        sessionId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._subscriptionPlanService.verifyStripeSession(
          technicianId,
          sessionId
        );

      console.log(
        "result from the verifying stripe session in technician controller:",
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
}

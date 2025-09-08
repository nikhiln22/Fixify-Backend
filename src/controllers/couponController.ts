import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ICouponService } from "../interfaces/Iservices/IcouponService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

@injectable()
export class CouponController {
  constructor(
    @inject("ICouponService") private _couponService: ICouponService
  ) {}

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
}

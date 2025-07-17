import { ICouponService } from "../interfaces/Iservices/IcouponService";
import { inject, injectable } from "tsyringe";
import { ICoupon } from "../interfaces/Models/Icoupon";
import { CouponData } from "../interfaces/DTO/IServices/IcouponService";
import { ICouponRepository } from "../interfaces/Irepositories/IcouponRepository";

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject("ICouponRepository") private couponRepository: ICouponRepository
  ) {}

  async addCoupon(data: CouponData): Promise<{
    success: boolean;
    message: string;
    data?: ICoupon;
  }> {
    try {
      console.log("entering to the service function that adds the coupon");
      console.log("data received:", data);

      const response = await this.couponRepository.addCoupon(data);
      console.log(
        "response from the coupon repository in the coupon service:",
        response
      );

      return {
        success: true,
        message: "coupon created successfully",
        data: response,
      };
    } catch (error) {
      console.log("error occured while add new coupon:", error);
      return {
        success: false,
        message: "Failed to create coupon",
      };
    }
  }

  async getAllCoupons(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      offers: ICoupon[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all the coupons");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.couponRepository.getAllCoupons({
        page,
        limit,
        search: options.search,
        filterStatus: options.filterStatus,
      });

      console.log("result from the coupon service:", result);

      return {
        success: true,
        message: "Coupons fetched successfully",
        data: {
          offers: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching coupons:", error);
      return {
        success: false,
        message: "Something went wrong while fetching coupons",
      };
    }
  }

  async blockCoupon(
    id: string
  ): Promise<{ message: string; success: boolean; coupon?: ICoupon }> {
    try {
      console.log("entering the service layer that blocks the coupon:", id);
      const coupon = await this.couponRepository.findCouponById(id);
      console.log("coupon fetched from repository:", coupon);

      if (!coupon) {
        return {
          success: false,
          message: "coupon not found",
        };
      }

      const newStatus = !coupon.status;
      const response = await this.couponRepository.blockCoupon(id, newStatus);
      console.log(
        "Response after toggling coupon status from the coupon repository:",
        response
      );

      return {
        success: true,
        message: `Coupon successfully ${newStatus ? "unblocked" : "blocked"}`,
        coupon: { ...coupon.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      return {
        message: "Failed to toggle coupon status",
        success: false,
      };
    }
  }

  async updateCoupon(
    couponId: string,
    updateData: {
      code?: string;
      title?: string;
      description?: string;
      discount_type?: number;
      discount_value?: number;
      max_discount?: number;
      min_booking_amount?: number;
      valid_until?: Date;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: ICoupon;
  }> {
    try {
      console.log(
        "entering the coupon service which updates the existing coupon added by the admin"
      );

      const offer = await this.couponRepository.findCouponById(couponId);
      if (!offer) {
        return {
          success: false,
          message: "coupon not found",
        };
      }

      const updatedCoupon = await this.couponRepository.updateCoupon(
        couponId,
        updateData
      );

      if (!updatedCoupon) {
        return {
          success: false,
          message: "Failed to update Coupon",
        };
      }

      return {
        success: true,
        message: "Coupon updated successfully",
        data: updatedCoupon,
      };
    } catch (error) {
      console.error("Error updating coupon:", error);
      return {
        success: false,
        message: "Failed to update coupon",
      };
    }
  }
}

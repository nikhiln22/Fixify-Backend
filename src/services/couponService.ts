import { ICouponService } from "../interfaces/Iservices/IcouponService";
import { inject, injectable } from "tsyringe";
import { ICoupon } from "../interfaces/Models/Icoupon";
import { CouponData } from "../interfaces/DTO/IServices/IcouponService";
import { ICouponRepository } from "../interfaces/Irepositories/IcouponRepository";
import { IServiceRepository } from "../interfaces/Irepositories/IserviceRepository";

@injectable()
export class CouponService implements ICouponService {
  constructor(
    @inject("ICouponRepository") private _couponRepository: ICouponRepository,
    @inject("IServiceRepository") private _serviceRepository: IServiceRepository
  ) {}

  async addCoupon(data: CouponData): Promise<{
    success: boolean;
    message: string;
    data?: ICoupon;
  }> {
    try {
      console.log("entering to the service function that adds the coupon");
      console.log("data received:", data);

      const response = await this._couponRepository.addCoupon(data);
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
      const page = options.page;
      const limit = options.limit;
      const result = await this._couponRepository.getAllCoupons({
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
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
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

  async blockCoupon(id: string): Promise<{
    message: string;
    success: boolean;
    data?: { _id: string; status: string };
  }> {
    try {
      console.log("entering the service layer that blocks the coupon:", id);
      const coupon = await this._couponRepository.findCouponById(id);
      console.log("coupon fetched from repository:", coupon);

      if (!coupon) {
        return {
          success: false,
          message: "coupon not found",
        };
      }

      const newStatus = coupon.status === "Active" ? "Blocked" : "Active";
      const response = await this._couponRepository.blockCoupon(id, newStatus);
      console.log(
        "Response after toggling coupon status from the coupon repository:",
        response
      );

      if (!response) {
        return {
          success: false,
          message: "Failed to update the coupon",
        };
      }

      return {
        success: true,
        message: `Coupon successfully ${
          newStatus === "Blocked" ? "blocked" : "unblocked"
        }`,
        data: {
          _id: response._id,
          status: response.status,
        },
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

      const offer = await this._couponRepository.findCouponById(couponId);
      if (!offer) {
        return {
          success: false,
          message: "coupon not found",
        };
      }

      const updatedCoupon = await this._couponRepository.updateCoupon(
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

  async getEligibleCoupons(
    userId: string,
    serviceId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Partial<ICoupon>[];
  }> {
    try {
      console.log("fetching eligible coupons for user");
      console.log("userId:", userId);
      console.log("serviceId:", serviceId);

      const service = await this._serviceRepository.findServiceById(serviceId);

      console.log("fetched service in coupon service:", service);

      if (!service) {
        return {
          success: false,
          message: "No Service Found",
        };
      }

      let priceForCoupon: number;

      if (service.serviceType === "fixed") {
        if (!service.price) {
          return {
            success: false,
            message: "Fixed service price not available",
          };
        }
        priceForCoupon = service.price;
      } else if (service.serviceType === "hourly") {
        if (!service.hourlyRate) {
          return {
            success: false,
            message: "Hourly rate not available",
          };
        }
        priceForCoupon = service.hourlyRate;
      } else {
        return {
          success: false,
          message: "Invalid service type",
        };
      }

      console.log("Price used for coupon eligibility:", priceForCoupon);
      console.log("Service type:", service.serviceType);

      const eligibleCoupons = await this._couponRepository.getEligibleCoupons(
        userId,
        priceForCoupon
      );

      console.log("eligible coupons from repository:", eligibleCoupons);

      const transformedCoupons = eligibleCoupons.map((coupon) => ({
        couponId: coupon._id,
        code: coupon.code,
        title: coupon.title,
        discountValue: coupon.discount_value,
        discountType: coupon.discount_type,
        maxDiscount: coupon.max_discount,
      }));

      return {
        success: true,
        message: "Eligible coupons fetched successfully",
        data: transformedCoupons,
      };
    } catch (error) {
      console.error("Error fetching eligible coupons:", error);
      return {
        success: false,
        message: "Failed to fetch eligible coupons",
      };
    }
  }

  async applyCoupon(
    userId: string,
    couponId: string,
    serviceId: string,
    hoursWorked?: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      couponCode: string;
      discountAmount: number;
      finalAmount: number;
      couponId: string;
    };
  }> {
    try {
      console.log("entered applyCoupon with:", {
        userId,
        couponId,
        serviceId,
        hoursWorked,
      });

      const service = await this._serviceRepository.findServiceById(serviceId);
      if (!service) {
        return { success: false, message: "Service not found" };
      }

      const coupon = await this._couponRepository.findCouponById(couponId);
      if (!coupon) {
        return { success: false, message: "Coupon not found" };
      }

      let originalAmount = 0;

      if (service.serviceType === "fixed") {
        if (!service.price) {
          return {
            success: false,
            message: "Price not defined for fixed service",
          };
        }
        originalAmount = service.price;
      } else if (service.serviceType === "hourly") {
        if (!service.hourlyRate) {
          return {
            success: false,
            message: "Hourly rate not defined for hourly service",
          };
        }

        if (!hoursWorked || hoursWorked <= 0) {
          return {
            success: false,
            message: "Hours worked must be provided for hourly services",
          };
        }

        originalAmount = service.hourlyRate * hoursWorked;
      } else {
        return {
          success: false,
          message: "Invalid service type",
        };
      }

      if (
        coupon.min_booking_amount &&
        originalAmount < coupon.min_booking_amount
      ) {
        return {
          success: false,
          message: `Minimum booking amount of ₹${coupon.min_booking_amount} required to use this coupon`,
        };
      }

      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = (originalAmount * coupon.discount_value) / 100;
        if (coupon.max_discount && discountAmount > coupon.max_discount) {
          discountAmount = coupon.max_discount;
        }
      } else if (coupon.discount_type === "flat_amount") {
        discountAmount = Math.min(coupon.discount_value, originalAmount);
      } else {
        return {
          success: false,
          message: "Invalid coupon discount type",
        };
      }

      const finalAmount = Math.max(originalAmount - discountAmount, 0);

      console.log("Coupon applied successfully:", {
        couponCode: coupon.code,
        originalAmount,
        discountAmount,
        finalAmount,
        serviceType: service.serviceType,
        hoursWorked: hoursWorked || "N/A",
      });

      return {
        success: true,
        message: "Coupon applied successfully",
        data: {
          couponId: coupon._id.toString(),
          couponCode: coupon.code,
          discountAmount,
          finalAmount,
        },
      };
    } catch (error) {
      console.error("Error applying coupon:", error);
      return {
        success: false,
        message: "Failed to apply coupon",
      };
    }
  }
}

import { CouponData } from "../DTO/IServices/IcouponService";
import { ICoupon } from "../Models/Icoupon";

export interface ICouponService {
  addCoupon(data: CouponData): Promise<{
    success: boolean;
    message: string;
    data?: ICoupon;
  }>;
  getAllCoupons(options: {
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
  }>;
  blockCoupon(id: string): Promise<{
    message: string;
    success: boolean;
    data?: {
      _id: string;
      status: string;
    };
  }>;
  updateCoupon(
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
  }>;
  getEligibleCoupons(
    userId: string,
    serviceId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Partial<ICoupon>[];
  }>;
  applyCoupon(
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
  }>;
}

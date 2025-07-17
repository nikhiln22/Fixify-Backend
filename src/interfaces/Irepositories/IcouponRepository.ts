import { couponData } from "../DTO/IServices/IcouponService";
import { ICoupon } from "../Models/Icoupon";

export interface ICouponRepository {
  addCoupon(data: couponData): Promise<ICoupon>;
  getAllCoupons(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    data: ICoupon[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  blockCoupon(id: string, status: boolean): Promise<void>;
  findCouponById(id: string): Promise<ICoupon | null>;
  updateCoupon(
    id: string,
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
  ): Promise<ICoupon | null>;
}

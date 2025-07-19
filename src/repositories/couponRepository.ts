import { BaseRepository } from "./baseRepository";
import { ICoupon } from "../interfaces/Models/Icoupon";
import coupon from "../models/couponModel";
import { ICouponRepository } from "../interfaces/Irepositories/IcouponRepository";
import { injectable } from "tsyringe";
import { FilterQuery } from "mongoose";
import { CouponData } from "../interfaces/DTO/IServices/IcouponService";

@injectable()
export class CouponRepository
  extends BaseRepository<ICoupon>
  implements ICouponRepository
{
  constructor() {
    super(coupon);
  }

  async addCoupon(data: CouponData): Promise<ICoupon> {
    try {
      console.log("creating offer in repository:", data);
      const newOffer = await this.create(data);
      return newOffer;
    } catch (error) {
      console.error("Error creating offer in repository:", error);
      throw error;
    }
  }

  async getAllCoupons(options: {
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
  }> {
    try {
      console.log("entering the function which fetches all the coupons");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<ICoupon> = {};

      if (options.search) {
        filter.$or = [
          { title: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.filterStatus) {
        if (options.filterStatus === "active") {
          filter.status = true;
        } else if (options.filterStatus === "inactive") {
          filter.status = false;
        }
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: ICoupon[]; total: number };

      console.log("data fetched from the coupon repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the offers:", error);
      throw new Error("Failed to fetch the offers");
    }
  }

  async findCouponById(id: string): Promise<ICoupon | null> {
    try {
      const coupon = await this.findById(id);
      console.log("fetched coupon from the coupon repository:", coupon);
      return coupon;
    } catch (error) {
      console.log("error occured while fetching the coupon:", error);
      return null;
    }
  }

  async blockCoupon(id: string, status: boolean): Promise<void> {
    try {
      const response = await this.updateOne({ _id: id }, { status: status });
      console.log("blocking the coupon in the coupon repository:", response);
    } catch (error) {
      throw new Error("Failed to block coupon: " + error);
    }
  }

  async updateCoupon(
    id: string,
    updateData: {
      title?: string;
      description?: string;
      offer_type?: string;
      discount_type?: number;
      discount_value?: number;
      max_discount?: number;
      min_booking_amount?: number;
      service_id?: string;
      valid_until?: Date;
    }
  ): Promise<ICoupon | null> {
    try {
      console.log(
        "entering to the coupon repository that updates the coupon data:",
        updateData
      );

      const updatedCoupon = await this.updateOne(
        { _id: id },
        { $set: updateData }
      );
      console.log("updated coupon in the coupon repository:", updatedCoupon);
      return updatedCoupon;
    } catch (error) {
      console.error(`Error updating coupon:`, error);
      throw new Error(`Failed to update coupon: ${error}`);
    }
  }
}

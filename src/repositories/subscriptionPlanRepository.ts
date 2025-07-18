import { BaseRepository } from "./baseRepository";
import subscriptionPlan from "../models/SubscriptionPlanModel";
import { injectable } from "tsyringe";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { FilterQuery } from "mongoose";

@injectable()
export class SubscriptionPlanRepository
  extends BaseRepository<ISubscriptionPlan>
  implements ISubscriptionPlanRepository
{
  constructor() {
    super(subscriptionPlan);
  }

  async addSubscriptionPlan(
    planName: "BASIC" | "PRO" | "ELITE",
    commissionRate: number,
    monthlyPrice: number
  ): Promise<ISubscriptionPlan> {
    try {
      console.log(
        "entered the subscription plan repository method that adds the subscription plan"
      );

      const data = {
        planName,
        commissionRate,
        monthlyPrice,
      };

      const result = await this.create(data);
      return result;
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      throw new Error("Error occurred while adding the subscription plan");
    }
  }

  async findByPlanName(
    planName: "BASIC" | "PRO" | "ELITE"
  ): Promise<ISubscriptionPlan | null> {
    try {
      const result = await this.findOne({ planName });
      return result;
    } catch (error) {
      console.log(
        "error occurred while finding subscription plan by name:",
        error
      );
      throw new Error("Error occurred while finding subscription plan");
    }
  }

  async getAllSubscriptionPlans(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    data: ISubscriptionPlan[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log(
        "entering the function which fetches all the subscription plans"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<ISubscriptionPlan> = {};

      if (options.search) {
        filter.$or = [{ planName: { $regex: options.search, $options: "i" } }];
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
      })) as { data: ISubscriptionPlan[]; total: number };

      console.log(
        "data fetched from the subscription plans repository:",
        result
      );

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log(
        "error occurred while fetching the subscription plans:",
        error
      );
      throw new Error("Failed to fetch the subscription plans");
    }
  }
}

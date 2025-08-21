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

  async addSubscriptionPlan(data: {
    planName: string;
    commissionRate: number;
    price: number;
    WalletCreditDelay: number;
    profileBoost: boolean;
    durationInMonths: number;
    description?: string;
  }): Promise<ISubscriptionPlan> {
    try {
      console.log(
        "entered the subscription plan repository method that adds the subscription plan"
      );

      const result = await this.create(data);
      return result;
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      throw new Error("Error occurred while adding the subscription plan");
    }
  }

  async findByPlanName(planName: string): Promise<ISubscriptionPlan | null> {
    try {
      const result = await this.findOne({
        planName: { $regex: new RegExp(`^${planName}$`, "i") },
      });
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
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<ISubscriptionPlan> = {};

      if (options.search) {
        filter.$or = [
          { planName: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.filterStatus) {
        if (options.filterStatus === "active") {
          filter.status = "Active";
        } else if (options.filterStatus === "inactive") {
          filter.status = "Blocked";
        }
      }

      if (page !== undefined && limit !== undefined) {
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
      } else {
        const allSubscriptionPlans = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as ISubscriptionPlan[];

        console.log(
          "all subscription plans without pagination:",
          allSubscriptionPlans
        );
        return {
          data: allSubscriptionPlans,
          total: allSubscriptionPlans.length,
          page: 1,
          limit: allSubscriptionPlans.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the subscription plans:",
        error
      );
      throw new Error("Failed to fetch the subscription plans");
    }
  }

  async findSubscriptionPlanById(
    id: string
  ): Promise<ISubscriptionPlan | null> {
    try {
      const subscriptionPlan = await this.findById(id);
      console.log(
        "fetched subscription plan from the subscription plan repository:",
        subscriptionPlan
      );
      return subscriptionPlan;
    } catch (error) {
      console.log("error occured while fetching the subscription plan:", error);
      return null;
    }
  }

  async blockSubscriptionPlan(
    id: string,
    status: string
  ): Promise<ISubscriptionPlan | null> {
    try {
      const response = await this.updateOne({ _id: id }, { status: status });
      console.log(
        "blocking the Subscription plan in the subscription plan repository:",
        response
      );
      return response;
    } catch (error) {
      throw new Error("Failed to block subscription plan: " + error);
    }
  }

  async updateSubscriptionPlan(
    id: string,
    updateData: {
      planName?: string;
      commissionRate?: number;
      price?: number;
      WalletCreditDelay?: number;
      profileBoost?: boolean;
      durationInMonths?: number;
      description?: string;
    }
  ): Promise<ISubscriptionPlan | null> {
    try {
      console.log(
        "entered the subscription plan repository method that updates the subscription plan"
      );
      console.log("Subscription plan ID:", id);
      console.log("Update data:", updateData);

      const result = await this.updateOne({ _id: id }, updateData);

      console.log("Update result from repository:", result);
      return result;
    } catch (error) {
      console.log(
        "error occurred while updating the subscription plan:",
        error
      );
      throw new Error("Error occurred while updating the subscription plan");
    }
  }

  async getActiveTechniciansCount(): Promise<number> {
    try {
      console.log("Getting active technicians count from subscription history");

      const result = await this.model.db
        .collection("subscriptionplanhistories")
        .aggregate([
          {
            $match: { status: "Active" },
          },
          {
            $group: {
              _id: "$technicianId",
            },
          },
          {
            $count: "total",
          },
        ])
        .toArray();

      const count = result.length > 0 ? result[0].total : 0;
      console.log("Active technicians count:", count);
      return count;
    } catch (error) {
      console.log("Error getting active technicians count:", error);
      throw new Error("Failed to get active technicians count");
    }
  }

  async getPaidSubscribersCount(): Promise<number> {
    try {
      console.log("Getting paid subscribers count from subscription history");

      const basicPlan = await this.findOne({ planName: "BASIC" });

      if (!basicPlan) {
        throw new Error("BASIC plan not found");
      }

      const result = await this.model.db
        .collection("subscriptionplanhistories")
        .aggregate([
          {
            $match: {
              status: "Active",
              subscriptionPlanId: { $ne: basicPlan._id },
            },
          },
          {
            $group: {
              _id: "$technicianId",
            },
          },
          {
            $count: "total",
          },
        ])
        .toArray();

      const count = result.length > 0 ? result[0].total : 0;
      console.log("Paid subscribers count:", count);
      return count;
    } catch (error) {
      console.log("Error getting paid subscribers count:", error);
      throw new Error("Failed to get paid subscribers count");
    }
  }

  async getMonthlyRevenue(): Promise<number> {
    try {
      console.log("Calculating monthly revenue from subscription history");

      const basicPlan = await this.findOne({ planName: "BASIC" });

      if (!basicPlan) {
        throw new Error("BASIC plan not found");
      }

      const result = await this.model.db
        .collection("subscriptionplanhistories")
        .aggregate([
          {
            $match: {
              status: "Active",
              subscriptionPlanId: { $ne: basicPlan._id },
            },
          },
          {
            $lookup: {
              from: "subscriptionplans",
              localField: "subscriptionPlanId",
              foreignField: "_id",
              as: "plan",
            },
          },
          {
            $unwind: "$plan",
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$plan.price" },
            },
          },
        ])
        .toArray();

      const revenue = result.length > 0 ? result[0].totalRevenue : 0;
      console.log("Monthly revenue:", revenue);
      return revenue;
    } catch (error) {
      console.log("Error calculating monthly revenue:", error);
      throw new Error("Failed to calculate monthly revenue");
    }
  }
}

import { injectable } from "tsyringe";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";
import subscriptionPlanHistory from "../models/subscriptionPlanHistoryModel";
import { BaseRepository } from "./baseRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { FilterQuery } from "mongoose";

@injectable()
export class SubscriptionPlanHistoryRepository
  extends BaseRepository<ISubscriptionPlanHistory>
  implements ISubscriptionPlanHistoryRepository
{
  constructor() {
    super(subscriptionPlanHistory);
  }

  async getSubscriptionPlansHistory(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    data: ISubscriptionPlanHistory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log(
        "entering to the subscription plan history fetching the subscription plan history"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<ISubscriptionPlanHistory> = {};

      if (options.search) {
        filter.$or = [{ planName: { $regex: options.search, $options: "i" } }];
      }

      if (options.filterStatus) {
        if (options.filterStatus === "Active") {
          filter.status = true;
        } else if (options.filterStatus === "Expired") {
          filter.status = false;
        }
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
        populate: [
          {
            path: "subscriptionPlanId",
            select: "planName createdAt durationInMonths",
          },
          { path: "technicianId", select: "username" },
        ],
      })) as { data: ISubscriptionPlanHistory[]; total: number };

      console.log(
        "data fetched from the subscription plans history repository:",
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
        "error occurred while fetching the subscription plans history:",
        error
      );
      throw new Error("Failed to fetch the subscription plans history");
    }
  }
}

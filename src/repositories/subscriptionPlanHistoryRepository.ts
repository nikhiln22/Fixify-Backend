import { injectable } from "tsyringe";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";
import subscriptionPlanHistory from "../models/subscriptionPlanHistoryModel";
import { BaseRepository } from "./baseRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { FilterQuery, Types } from "mongoose";

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
    technicianId?: string;
  }): Promise<{
    data: ISubscriptionPlanHistory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("Fetching subscription plan history with options:", options);

      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<ISubscriptionPlanHistory> = {};

      if (options.technicianId) {
        filter.technicianId = options.technicianId;
      }

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
            select: "planName createdAt durationInMonths commissionRate",
          },
          {
            path: "technicianId",
            select: "username",
          },
        ],
      })) as { data: ISubscriptionPlanHistory[]; total: number };

      console.log(
        "Data fetched from subscription plans history repository:",
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
        "Error occurred while fetching subscription plans history:",
        error
      );
      throw new Error("Failed to fetch subscription plans history");
    }
  }

  async createHistory(historyData: {
    technicianId: string;
    subscriptionPlanId: string;
    paymentId?: string;
    amount: number;
    status: "Active" | "Expired";
  }): Promise<ISubscriptionPlanHistory> {
    try {
      console.log("Creating subscription plan history:", historyData);

      const mongoHistoryData: Partial<ISubscriptionPlanHistory> = {
        technicianId: new Types.ObjectId(historyData.technicianId),
        subscriptionPlanId: new Types.ObjectId(historyData.subscriptionPlanId),
        amount: historyData.amount,
        paymentId: new Types.ObjectId(historyData.paymentId),
        status: historyData.status,
      };

      const newHistory = await this.create(mongoHistoryData);
      return newHistory;
    } catch (error) {
      console.log("Error occurred while creating subscription history:", error);
      throw error;
    }
  }

  async updateSubscriptionHistory(
    technicianId: string
  ): Promise<ISubscriptionPlanHistory | null> {
    try {
      console.log(
        "entering the repository history function that updates the subscription history"
      );
      console.log(
        "technicianId in the subscription history repository:",
        technicianId
      );
      const updatedSubscriptionHistory = await this.updateOne(
        {
          technicianId: new Types.ObjectId(technicianId),
          status: "Active",
        },
        {
          status: "Expired",
        }
      );

      return updatedSubscriptionHistory;
    } catch (error) {
      console.log(
        "error occured while updating the subscription history:",
        error
      );
      throw error;
    }
  }

  async findAllActiveSubscriptions(): Promise<ISubscriptionPlanHistory[]> {
    try {
      console.log("entered to the function that find all active subscriptions");
      const result = (await this.find({
        status: "Active",
      })) as ISubscriptionPlanHistory[];
      return result;
    } catch (error) {
      console.log("error occured while fetching all the active subscriptions");
      throw error;
    }
  }
}

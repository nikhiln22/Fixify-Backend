import { injectable } from "tsyringe";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";
import subscriptionPlanHistory from "../models/subscriptionPlanHistoryModel";
import { BaseRepository } from "./baseRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import mongoose, { FilterQuery, Types } from "mongoose";

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

      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<ISubscriptionPlanHistory> = {};

      if (options.technicianId) {
        filter.technicianId = options.technicianId;
      }

      if (options.search) {
        filter.$or = [{ planName: { $regex: options.search, $options: "i" } }];
      }

      if (options.filterStatus) {
        if (options.filterStatus === "Active") {
          filter.status = "Active";
        } else if (options.filterStatus === "Expired") {
          filter.status = "Expired";
        }
      }

      if (page !== undefined && limit !== undefined) {
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
      } else {
        const allSubscriptionHistories = (await this.find(filter, {
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
        })) as ISubscriptionPlanHistory[];
        return {
          data: allSubscriptionHistories,
          total: allSubscriptionHistories.length,
          page: 1,
          limit: allSubscriptionHistories.length,
          pages: 1,
        };
      }
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
    expiryDate?: Date;
    hasNextUpgrade?: boolean;
    nextUpgrade?: {
      planId: string;
      amount: number;
      paymentId: string;
    };
  }): Promise<ISubscriptionPlanHistory> {
    try {
      console.log("Creating subscription plan history:", historyData);

      const mongoHistoryData: Partial<ISubscriptionPlanHistory> = {
        technicianId: new Types.ObjectId(historyData.technicianId),
        subscriptionPlanId: new Types.ObjectId(historyData.subscriptionPlanId),
        amount: historyData.amount,
        status: historyData.status,
        expiryDate: historyData.expiryDate,
        hasNextUpgrade: historyData.hasNextUpgrade || false,
      };

      if (historyData.paymentId) {
        mongoHistoryData.paymentId = new Types.ObjectId(historyData.paymentId);
      }

      if (historyData.nextUpgrade) {
        mongoHistoryData.nextUpgrade = {
          planId: new Types.ObjectId(historyData.nextUpgrade.planId),
          amount: historyData.nextUpgrade.amount,
          paymentId: new Types.ObjectId(historyData.nextUpgrade.paymentId),
        };
      }

      const newHistory = await this.create(mongoHistoryData);
      return newHistory;
    } catch (error) {
      console.log("Error occurred while creating subscription history:", error);
      throw error;
    }
  }

  async updateSubscriptionHistory(
    technicianId: string,
    updateData: {
      status?: "Active" | "Expired";
      hasNextUpgrade?: boolean;
      nextUpgrade?: {
        planId: string;
        amount: number;
        paymentId: string;
      };
    }
  ): Promise<ISubscriptionPlanHistory | null> {
    try {
      console.log(
        "entering the repository history function that updates the subscription history"
      );
      console.log(
        "technicianId in the subscription history repository:",
        technicianId
      );

      const processedUpdateData: {
        status?: "Active" | "Expired";
        hasNextUpgrade?: boolean;
        nextUpgrade?: {
          planId: Types.ObjectId;
          amount: number;
          paymentId: Types.ObjectId;
        };
      } = {
        status: updateData.status,
        hasNextUpgrade: updateData.hasNextUpgrade,
      };

      if (updateData.nextUpgrade) {
        processedUpdateData.nextUpgrade = {
          planId: new Types.ObjectId(updateData.nextUpgrade.planId),
          amount: updateData.nextUpgrade.amount,
          paymentId: new Types.ObjectId(updateData.nextUpgrade.paymentId),
        };
      }

      const updatedSubscriptionHistory = await this.updateOne(
        {
          technicianId: new Types.ObjectId(technicianId),
          status: "Active",
        },
        processedUpdateData
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

  async findActiveSubscriptionByTechnicianId(
    technicianId: string
  ): Promise<ISubscriptionPlanHistory | null> {
    try {
      console.log(
        "finding the active subscriptions of the technician:",
        technicianId
      );
      const technicianPlan = await this.findOne(
        {
          technicianId: new mongoose.Types.ObjectId(technicianId),
          status: "Active",
          $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
        },
        {
          populate: {
            path: "nextUpgrade.planId",
            select:
              "planName durationInMonths commissionRate WalletCreditDelay profileBoost",
          },
        }
      );

      console.log("found active subscription:", technicianPlan);
      return technicianPlan;
    } catch (error) {
      console.log(
        "error occured while fetching the techncian active plan:",
        error
      );
      throw error;
    }
  }
}

import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";

@injectable()
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository
  ) {}

  async addSubscriptionPlan(data: {
    planName: string;
    commissionRate: number;
    price: number;
    WalletCreditDelay: number;
    profileBoost: boolean;
    durationInMonths: number;
    description?: string;
  }): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that adds the plan"
      );
      console.log("Subscription plan data:", data);

      const existingPlan =
        await this._subscriptionPlanRepository.findByPlanName(data.planName);
      if (existingPlan) {
        return {
          message: `Subscription plan '${data.planName}' already exists`,
          success: false,
        };
      }

      const result = await this._subscriptionPlanRepository.addSubscriptionPlan(
        data
      );

      console.log("result after adding the subscription plan:", result);

      return {
        message: "Subscription plan added successfully",
        success: true,
        data: result,
      };
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      return {
        message: "Error occurred while adding the subscription plan",
        success: false,
      };
    }
  }

  async getAllSubscriptionPlans(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      subscriptionPlans: ISubscriptionPlan[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      overview: {
        activeTechnicians: number;
        paidSubscribers: number;
        monthlyRevenue: number;
      };
    };
  }> {
    try {
      console.log("Function fetching all the Subscription Plans");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result =
        await this._subscriptionPlanRepository.getAllSubscriptionPlans({
          page,
          limit,
          search: options.search,
          filterStatus: options.filterStatus,
        });

      console.log("result from the Subscription Plans service:", result);

      const activeTechnicians =
        await this._subscriptionPlanRepository.getActiveTechniciansCount();
      const paidSubscribers =
        await this._subscriptionPlanRepository.getPaidSubscribersCount();
      const monthlyRevenue =
        await this._subscriptionPlanRepository.getMonthlyRevenue();

      return {
        success: true,
        message: "Subscription Plans fetched successfully",
        data: {
          subscriptionPlans: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
          overview: {
            activeTechnicians,
            paidSubscribers,
            monthlyRevenue,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching Subscription Plans:", error);
      return {
        success: false,
        message: "Something went wrong while fetching Subscription Plans",
      };
    }
  }

  async blockSubscriptionPlan(id: string): Promise<{
    message: string;
    success: boolean;
    coupon?: ISubscriptionPlan;
  }> {
    try {
      console.log("entering the service layer that blocks the coupon:", id);
      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(id);
      console.log("coupon fetched from repository:", subscriptionPlan);

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "subscription plan not found",
        };
      }

      const newStatus = !subscriptionPlan.status;
      const response =
        await this._subscriptionPlanRepository.blockSubscriptionPlan(
          id,
          newStatus
        );
      console.log(
        "Response after toggling subscription plan status from the coupon repository:",
        response
      );

      return {
        success: true,
        message: `subscription plan successfully ${
          newStatus ? "unblocked" : "blocked"
        }`,
        coupon: { ...subscriptionPlan.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling subscription plan status:", error);
      return {
        message: "Failed to toggle subscription plan status",
        success: false,
      };
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
  ): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that updates the plan"
      );
      console.log("Subscription plan ID:", id);
      console.log("Update data:", updateData);

      const existingPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(id);
      if (!existingPlan) {
        return {
          message: "Subscription plan not found",
          success: false,
        };
      }

      if (
        updateData.planName &&
        updateData.planName !== existingPlan.planName
      ) {
        const planWithSameName =
          await this._subscriptionPlanRepository.findByPlanName(
            updateData.planName
          );
        if (planWithSameName && planWithSameName._id.toString() !== id) {
          return {
            message: `Subscription plan '${updateData.planName}' already exists`,
            success: false,
          };
        }
      }

      const result =
        await this._subscriptionPlanRepository.updateSubscriptionPlan(
          id,
          updateData
        );

      if (!result) {
        return {
          message: "Failed to update subscription plan",
          success: false,
        };
      }

      console.log("result after updating the subscription plan:", result);

      return {
        message: "Subscription plan updated successfully",
        success: true,
        data: result,
      };
    } catch (error) {
      console.log(
        "error occurred while updating the subscription plan:",
        error
      );
      return {
        message: "Error occurred while updating the subscription plan",
        success: false,
      };
    }
  }

  async getTechniciansWithSubscriptions(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      subscriptionPlanHistory: ISubscriptionPlanHistory[];
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
      console.log(
        "entered to the technician service that fetches the technicians with subscription plans"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result =
        await this._subscriptionPlanHistoryRepository.getSubscriptionPlansHistory(
          {
            page,
            limit,
            search: options.search,
            filterStatus: options.filterStatus,
          }
        );
      console.log("result from the technician service:", result);

      return {
        success: true,
        message: "Technicians subscription plan fetched successfully",
        data: {
          subscriptionPlanHistory: result.data,
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
      console.log(
        "error occured while fetching the technicians with subscription plans",
        error
      );
      throw Error(
        "error occured while fetching the technicians with subscription plans"
      );
    }
  }
}

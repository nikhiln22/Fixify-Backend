import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";

@injectable()
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private subscriptionPlanRepository: ISubscriptionPlanRepository
  ) {}

  async addSubscriptionPlan(
    planName: "BASIC" | "PRO" | "ELITE",
    commissionRate: number,
    monthlyPrice: number
  ): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that adds the plan"
      );
      console.log(
        `planName:${planName}, monthlyPrice:${monthlyPrice}, commissionRate:${commissionRate}`
      );

      const existingPlan = await this.subscriptionPlanRepository.findByPlanName(
        planName
      );
      if (existingPlan) {
        return {
          message: `Subscription plan '${planName}' already exists`,
          success: false,
        };
      }

      const result = await this.subscriptionPlanRepository.addSubscriptionPlan(
        planName,
        commissionRate,
        monthlyPrice
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
    };
  }> {
    try {
      console.log("Function fetching all the Subscription Plans");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result =
        await this.subscriptionPlanRepository.getAllSubscriptionPlans({
          page,
          limit,
          search: options.search,
          filterStatus: options.filterStatus,
        });

      console.log("result from the Subscription Plans service:", result);

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
}

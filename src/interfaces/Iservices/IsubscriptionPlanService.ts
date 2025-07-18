import { ISubscriptionPlan } from "../Models/IsubscriptionPlan";

export interface ISubscriptionPlanService {
  addSubscriptionPlan(
    planName: "BASIC" | "PRO" | "ELITE",
    commissionRate: number,
    monthlyPrice: number
  ): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }>;
  getAllSubscriptionPlans(options: {
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
  }>;
}

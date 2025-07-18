import { ISubscriptionPlan } from "../Models/IsubscriptionPlan";

export interface ISubscriptionPlanRepository {
  addSubscriptionPlan(
    planName: "BASIC" | "PRO" | "ELITE",
    commissionRate: number,
    monthlyPrice: number
  ): Promise<ISubscriptionPlan>;

  findByPlanName(
    planName: "BASIC" | "PRO" | "ELITE"
  ): Promise<ISubscriptionPlan | null>;

  getAllSubscriptionPlans(options: {
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
  }>;
}

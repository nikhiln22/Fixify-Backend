import { ISubscriptionPlan } from "../Models/IsubscriptionPlan";

export interface ISubscriptionPlanRepository {
  addSubscriptionPlan(data: {
    planName: string;
    commissionRate: number;
    price: number;
    WalletCreditDelay: number;
    profileBoost: boolean;
    durationInMonths: number;
    description?: string;
  }): Promise<ISubscriptionPlan>;

  findByPlanName(planName: string): Promise<ISubscriptionPlan | null>;

  findSubscriptionPlanById(id: string): Promise<ISubscriptionPlan | null>;

  blockSubscriptionPlan(
    id: string,
    status: string
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
  updateSubscriptionPlan(
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
  ): Promise<ISubscriptionPlan | null>;
  getActiveTechniciansCount(): Promise<number>;
  getPaidSubscribersCount(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
}

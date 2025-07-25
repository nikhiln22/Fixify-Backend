import { ISubscriptionPlan } from "../Models/IsubscriptionPlan";
import { ISubscriptionPlanHistory } from "../Models/IsubscriptionPlanHistory";

export interface ISubscriptionPlanService {
  addSubscriptionPlan(data: {
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
      overview: {
        activeTechnicians: number;
        paidSubscribers: number;
        monthlyRevenue: number;
      };
    };
  }>;
  blockSubscriptionPlan(id: string): Promise<{
    message: string;
    success: boolean;
    coupon?: ISubscriptionPlan;
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
  ): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }>;
  getTechniciansWithSubscriptions(options: {
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
  }>;
}

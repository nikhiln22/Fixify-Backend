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
    data?: {
      _id: string;
      status: string;
    };
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
  getSubscriptionHistory(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
    technicianId?: string;
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
  purchaseSubscriptionPlan(
    technicianId: string,
    planId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { checkoutUrl: string };
  }>;
  verifyStripeSession(
    technicianId: string,
    sessionId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      currentSubscription: {
        planName: string;
        status: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        expiresAt?: string;
        amount: number;
      };
      upcomingSubscription?: {
        planName: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        amount: number;
        activatesOn?: string;
      } | null;
      newHistoryEntry: ISubscriptionPlanHistory;
    };
  }>;
  getTechnicianActiveSubscriptionPlan(technicianId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      currentSubscription: {
        planName: string;
        status: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        expiresAt?: string;
        amount: number;
      };
      upcomingSubscription?: {
        planName: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        amount: number;
        activatesOn?: string;
      } | null;
    };
  }>;
}

import { ISubscriptionPlanHistory } from "../Models/IsubscriptionPlanHistory";

export interface ISubscriptionPlanHistoryRepository {
  getSubscriptionPlansHistory(options: {
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
  }>;
  createHistory(historyData: {
    technicianId: string;
    subscriptionPlanId: string;
    paymentId?: string;
    amount: number;
    hasNextUpgrade?: boolean;
    status: "Active" | "Expired";
    expiryDate?: Date;
  }): Promise<ISubscriptionPlanHistory>;
  updateSubscriptionHistory(
    technicianId: string,
    updateData?: {
      status?: "Active" | "Expired";
      hasNextUpgrade?: boolean;
      nextUpgrade?: {
        planId: string;
        amount: number;
        paymentId: string;
      };
    }
  ): Promise<ISubscriptionPlanHistory | null>;
  findAllActiveSubscriptions(): Promise<ISubscriptionPlanHistory[]>;
  findActiveSubscriptionByTechnicianId(
    technicianId: string
  ): Promise<ISubscriptionPlanHistory | null>;
}

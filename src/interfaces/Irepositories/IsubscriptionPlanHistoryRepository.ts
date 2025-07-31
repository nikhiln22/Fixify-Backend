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
    status: "Active" | "Expired";
  }): Promise<ISubscriptionPlanHistory>;
  updateSubscriptionHistory(
    technicianId: string
  ): Promise<ISubscriptionPlanHistory | null>;
  findAllActiveSubscriptions(): Promise<ISubscriptionPlanHistory[]>;
}

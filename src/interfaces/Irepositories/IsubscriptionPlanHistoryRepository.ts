import { ISubscriptionPlanHistory } from "../Models/IsubscriptionPlanHistory";

export interface ISubscriptionPlanHistoryRepository {
  getSubscriptionPlansHistory(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    data: ISubscriptionPlanHistory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
}

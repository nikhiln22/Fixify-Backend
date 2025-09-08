import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletTransactionRepository {
  createTransaction(
    transaction: Partial<IWalletTransaction>
  ): Promise<IWalletTransaction>;
  findByReferenceId(
    referenceId: string,
    type?: string
  ): Promise<IWalletTransaction | null>;
  getOwnerWalletTransactions(options: {
    page?: number;
    limit?: number;
    ownerId: string;
    ownerType: string;
  }): Promise<{
    data: IWalletTransaction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  getTotalEarningsForTechnician(technicianId: string): Promise<number>;
}

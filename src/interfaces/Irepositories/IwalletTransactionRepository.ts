import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletTransactionRepository {
  createTransaction(
    transaction: Partial<IWalletTransaction>
  ): Promise<IWalletTransaction>;
  findByReferenceId(
    referenceId: string,
    type?: string
  ): Promise<IWalletTransaction | null>;
  getUserWalletTranasctions(options: {
    page?: number;
    limit?: number;
    userId: string;
    walletId: string;
  }): Promise<{
    data: IWalletTransaction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
}

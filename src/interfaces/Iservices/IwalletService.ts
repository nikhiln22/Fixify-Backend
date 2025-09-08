import { AddMoneyResponse } from "../DTO/IServices/IuserService";
import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletService {
  addMoney(
    userId: string,
    amount: number,
    role: string
  ): Promise<AddMoneyResponse>;
  verifyWalletStripeSession(
    sessionId: string,
    userId: string,
    role: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      wallet: IWallet | null;
      transaction: IWalletTransaction | null;
    };
  }>;
  getWalletBalance(
    userId: string,
    role: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { balance: number };
  }>;
  getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    userId: string;
    role: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      transactions: IWalletTransaction[];
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

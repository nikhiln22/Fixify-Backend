import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletRepository {
  createWallet(userId: string): Promise<IWallet>;
  getWalletByUserId(userId: string): Promise<IWallet | null>;
  addMoney(
    amount: number,
    userId: string,
    sessionId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }>;
  updateWalletBalanceWithTransaction(
    userId: string,
    amount: number,
    type: "Credit" | "Debit",
    description: string,
    referenceId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }>;
}

import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletRepository {
  createWallet(ownerId: string, ownerType: string): Promise<IWallet>;
  getWalletByOwnerId(
    ownerId: string,
    ownerType: string
  ): Promise<IWallet | null>;
  addMoney(
    amount: number,
    ownerId: string,
    ownerType: string,
    sessionId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }>;
  updateWalletBalanceWithTransaction(
    ownerId: string,
    ownerType: string,
    amount: number,
    type: "Credit" | "Debit",
    description: string,
    referenceId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }>;
  getTechncianTotalEarnings(technicianId: string): Promise<number>;
}

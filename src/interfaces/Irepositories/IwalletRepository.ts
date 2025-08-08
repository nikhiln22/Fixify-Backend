import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IWalletRepository {
  createWallet(
    ownerId: string,
    ownerType: "user" | "technician"
  ): Promise<IWallet>;
  getWalletByOwnerId(
    ownerId: string,
    ownerType: "user" | "technician"
  ): Promise<IWallet | null>;
  addMoney(
    amount: number,
    ownerId: string,
    ownerType: "user" | "technician",
    sessionId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }>;
  updateWalletBalanceWithTransaction(
    ownerId: string,
    ownerType: "user" | "technician",
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

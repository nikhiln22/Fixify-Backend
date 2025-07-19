import { injectable, inject } from "tsyringe";
import wallet from "../models/walletModel";
import { IWallet } from "../interfaces/Models/Iwallet";
import { BaseRepository } from "./baseRepository";
import { Types } from "mongoose";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";

@injectable()
export class WalletRepository
  extends BaseRepository<IWallet>
  implements IWalletRepository
{
  constructor(
    @inject("IWalletTransactionRepository")
    private _walletTransactionRepository: IWalletTransactionRepository
  ) {
    super(wallet);
  }

  async createWallet(
    ownerId: string,
    ownerType: "user" | "technician"
  ): Promise<IWallet> {
    try {
      console.log("creating new wallet for:", ownerType, ownerId);
      const newWallet = await this.create({
        ownerId: new Types.ObjectId(ownerId),
        ownerType: ownerType,
        balance: 0,
      });
      console.log("newly created wallet in the walletrepository:", newWallet);
      return newWallet;
    } catch (error) {
      console.log("error occured while creating the new Wallet:", error);
      throw error;
    }
  }

  async getWalletByOwnerId(
    ownerId: string,
    ownerType: "user" | "technician"
  ): Promise<IWallet | null> {
    try {
      console.log("getting wallet for:", ownerType, ownerId);
      const ownerWallet = await this.findOne({
        ownerId: new Types.ObjectId(ownerId),
        ownerType: ownerType,
      });
      console.log("found wallet:", ownerWallet);
      return ownerWallet;
    } catch (error) {
      console.log("error occurred while getting wallet:", error);
      throw error;
    }
  }

  async addMoney(
    amount: number,
    ownerId: string,
    ownerType: "user" | "technician",
    sessionId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }> {
    try {
      console.log("Adding money to wallet:", {
        amount,
        ownerId,
        ownerType,
        sessionId,
      });

      const existingTransaction =
        await this._walletTransactionRepository.findByReferenceId(
          sessionId,
          "Credit"
        );

      if (existingTransaction) {
        console.log("Transaction already processed for session:", sessionId);
        const wallet = await this.findOne({
          ownerId: new Types.ObjectId(ownerId),
          ownerType: ownerType,
        });
        return {
          wallet,
          transaction: existingTransaction,
        };
      }

      const ownerWallet = await this.findOne({
        ownerId: new Types.ObjectId(ownerId),
        ownerType: ownerType,
      });

      if (!ownerWallet) {
        throw new Error("Wallet not found");
      }

      const session = await wallet.startSession();

      try {
        await session.startTransaction();

        const updatedWallet = await this.updateOne(
          { ownerId: new Types.ObjectId(ownerId), ownerType: ownerType },
          { $inc: { balance: amount } }
        );

        const newTransaction =
          await this._walletTransactionRepository.createTransaction({
            ownerId: new Types.ObjectId(ownerId),
            ownerType: ownerType,
            walletId: ownerWallet._id as Types.ObjectId,
            type: "Credit",
            description: "Wallet top-up via Stripe",
            amount: amount,
            referenceId: sessionId,
          });

        await session.commitTransaction();
        console.log("Money added successfully to wallet");

        return {
          wallet: updatedWallet,
          transaction: newTransaction,
        };
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    } catch (error) {
      console.log("Error adding money to wallet:", error);
      throw error;
    }
  }

  async updateWalletBalanceWithTransaction(
    ownerId: string,
    ownerType: "user" | "technician",
    amount: number,
    type: "Credit" | "Debit",
    description: string,
    referenceId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }> {
    const session = await wallet.startSession();

    try {
      await session.startTransaction();

      const ownerWallet = await this.findOne({
        ownerId: new Types.ObjectId(ownerId),
        ownerType: ownerType,
      });

      if (!ownerWallet) {
        throw new Error("Wallet not found");
      }

      if (type === "Debit" && ownerWallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      const balanceChange = type === "Credit" ? amount : -amount;
      const updatedWallet = await this.updateOne(
        { _id: ownerWallet._id },
        { $inc: { balance: balanceChange } }
      );

      if (!updatedWallet) {
        throw new Error("Failed to update wallet balance");
      }

      const walletId =
        ownerWallet._id instanceof Types.ObjectId
          ? ownerWallet._id
          : new Types.ObjectId(ownerWallet._id);

      const newTransaction =
        await this._walletTransactionRepository.createTransaction({
          ownerId: ownerId,
          ownerType: ownerType,
          walletId: walletId.toString(),
          type: type,
          description: description,
          amount: amount,
          referenceId: referenceId,
        });

      await session.commitTransaction();
      console.log(
        "Wallet balance updated and transaction created successfully"
      );

      return {
        wallet: updatedWallet,
        transaction: newTransaction,
      };
    } catch (error) {
      await session.abortTransaction();
      console.log("Transaction failed, rolling back:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

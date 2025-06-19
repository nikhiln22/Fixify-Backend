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
    private walletTransactionRepository: IWalletTransactionRepository
  ) {
    super(wallet);
  }

  async createWallet(userId: string): Promise<IWallet> {
    try {
      console.log("creating new wallet for an user");
      const newWallet = await this.create({
        userId: new Types.ObjectId(userId),
        balance: 0,
      });
      console.log("newly created wallet in the walletrepository:", newWallet);
      return newWallet;
    } catch (error) {
      console.log("error occured while creating the new Wallet:", error);
      throw error;
    }
  }

  async getWalletByUserId(userId: string): Promise<IWallet | null> {
    try {
      console.log("getting wallet for user:", userId);
      const userWallet = await this.findOne({
        userId: new Types.ObjectId(userId),
      });
      console.log("found wallet:", userWallet);
      return userWallet;
    } catch (error) {
      console.log("error occurred while getting wallet:", error);
      throw error;
    }
  }

  async addMoney(
    amount: number,
    userId: string,
    sessionId: string
  ): Promise<{
    wallet: IWallet | null;
    transaction: IWalletTransaction | null;
  }> {
    try {
      console.log("Adding money to wallet:", { amount, userId, sessionId });

      const existingTransaction =
        await this.walletTransactionRepository.findByReferenceId(
          sessionId,
          "Credit"
        );

      if (existingTransaction) {
        console.log("Transaction already processed for session:", sessionId);
        const wallet = await this.findOne({
          userId: new Types.ObjectId(userId),
        });
        return {
          wallet,
          transaction: existingTransaction,
        };
      }

      const userWallet = await this.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!userWallet) {
        throw new Error("Wallet not found");
      }

      const session = await wallet.startSession();

      try {
        await session.startTransaction();

        const updatedWallet = await this.updateOne(
          { userId: new Types.ObjectId(userId) },
          { $inc: { balance: amount } }
        );

        const newTransaction =
          await this.walletTransactionRepository.createTransaction({
            userId: new Types.ObjectId(userId),
            walletId: userWallet._id as Types.ObjectId,
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
    userId: string,
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

      const userWallet = await this.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (!userWallet) {
        throw new Error("Wallet not found");
      }

      if (type === "Debit" && userWallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
      }

      const balanceChange = type === "Credit" ? amount : -amount;
      const updatedWallet = await this.updateOne(
        { _id: userWallet._id },
        { $inc: { balance: balanceChange } }
      );

      if (!updatedWallet) {
        throw new Error("Failed to update wallet balance");
      }

      const walletId =
        userWallet._id instanceof Types.ObjectId
          ? userWallet._id
          : new Types.ObjectId(userWallet._id);

      const newTransaction =
        await this.walletTransactionRepository.createTransaction({
          userId: userId,
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

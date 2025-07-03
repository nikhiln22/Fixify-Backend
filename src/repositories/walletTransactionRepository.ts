import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import walletTransaction from "../models/walletTransactionModel";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class WalletTransactionRepository
  extends BaseRepository<IWalletTransaction>
  implements IWalletTransactionRepository
{
  constructor() {
    super(walletTransaction);
  }

  async createTransaction(
    transaction: Partial<IWalletTransaction>
  ): Promise<IWalletTransaction> {
    return await super.create(transaction);
  }

  async findByReferenceId(
    referenceId: string,
    type?: string
  ): Promise<IWalletTransaction | null> {
    const filter: any = { referenceId };
    if (type) {
      filter.type = type;
    }
    return await this.findOne(filter);
  }

  async getOwnerWalletTransactions(options: {
    page?: number;
    limit?: number;
    ownerId: string;
    ownerType: "user" | "technician";
  }): Promise<{
    data: IWalletTransaction[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log(
        "fetching wallet transactions for owner:",
        options.ownerId,
        options.ownerType
      );

      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IWalletTransaction> = {
        ownerId: new Types.ObjectId(options.ownerId),
        ownerType: options.ownerType,
      };

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IWalletTransaction[]; total: number };

      console.log("Found", result.total, "transactions for", options.ownerType);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching wallet transactions:", error);
      throw new Error("Failed to fetch wallet transactions");
    }
  }
}

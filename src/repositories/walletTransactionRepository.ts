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

  async getUserWalletTranasctions(options: {
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
  }> {
    try {
      console.log(
        "fetching all the wallet transactions done by the user in wallet transaction repository"
      );

      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IWalletTransaction> = {};

      if (options.userId) {
        filter.userId = options.userId;
      }

      if (options.walletId) {
        filter.walletId = options.walletId;
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IWalletTransaction[]; total: number };

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  }
}

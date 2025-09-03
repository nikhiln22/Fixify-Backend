import { inject, injectable } from "tsyringe";
import { AddMoneyResponse } from "../interfaces/DTO/IServices/IuserService";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import config from "../config/env";
import { stripe } from "../config/stripeConfig";
import { IWallet } from "../interfaces/Models/Iwallet";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import { IWalletService } from "../interfaces/Iservices/IwalletService";

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IWalletTransactionRepository")
    private _walletTransactionRepository: IWalletTransactionRepository
  ) {}

  async addMoney(
    userId: string,
    amount: number,
    role: string
  ): Promise<AddMoneyResponse> {
    try {
      console.log("Add money service called:", { userId, amount });

      if (!amount || amount <= 0) {
        return {
          success: false,
          message: "Invalid amount. Amount must be greater than 0",
        };
      }

      if (amount < 100) {
        return {
          success: false,
          message: "Minimum amount to add is ₹100",
        };
      }

      if (amount > 1000) {
        return {
          success: false,
          message: "Maximum amount to add is ₹1,000",
        };
      }

      let wallet = await this._walletRepository.getWalletByOwnerId(
        userId,
        role
      );
      if (!wallet) {
        wallet = await this._walletRepository.createWallet(userId, role);
      }

      const amountInCents = Math.round(amount * 100);

      const getClientUrl = () => {
        switch (config.NODE_ENV) {
          case "production":
            return config.CLIENT_URL || "https://www.fixify.homes";
          case "development":
          default:
            return config.CLIENT_URL || "http://localhost:5173";
        }
      };

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Wallet Top-up",
                description: "Add money to your Fixify wallet",
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          amount: amount.toString(),
          type: "wallet_topup",
        },
        success_url: `${getClientUrl()}/user/wallet?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getClientUrl()}/user/wallet-cancelled`,
      });

      console.log("Stripe session created:", session.id);

      return {
        success: true,
        message: "Payment session created successfully",
        data: {
          checkoutUrl: session.url!,
          sessionId: session.id,
          requiresPayment: true,
        },
      };
    } catch (error) {
      console.log("Error in addMoney service:", error);
      return {
        success: false,
        message: "Failed to create payment session",
      };
    }
  }

  async verifyWalletStripeSession(
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
  }> {
    try {
      console.log("Verifying Stripe session:", { sessionId, userId });

      const existingTransaction =
        await this._walletTransactionRepository.findByReferenceId(
          sessionId,
          "Credit"
        );

      if (existingTransaction) {
        console.log("Session already processed:", sessionId);
        const wallet = await this._walletRepository.getWalletByOwnerId(
          userId,
          "user"
        );
        return {
          success: true,
          message: "Transaction already processed successfully",
          data: {
            wallet,
            transaction: existingTransaction,
          },
        };
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed or session not found",
        };
      }

      const amount = parseFloat(session.metadata?.amount || "0");

      console.log("amount in the userService:", amount);

      if (!amount || amount <= 0) {
        return {
          success: false,
          message: "Invalid amount in session",
        };
      }

      if (session.metadata?.userId !== userId) {
        return {
          success: false,
          message: "Session does not belong to this user",
        };
      }

      const result = await this._walletRepository.addMoney(
        amount,
        userId,
        role,
        sessionId
      );

      console.log("Wallet updated successfully:", result.wallet);
      console.log("Transaction created:", result.transaction);

      return {
        success: true,
        message: "Money added to wallet successfully",
        data: {
          wallet: result.wallet,
          transaction: result.transaction,
        },
      };
    } catch (error) {
      console.log("Error verifying Stripe session:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  async getWalletBalance(
    userId: string,
    role: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { balance: number };
  }> {
    try {
      console.log(
        "entering to the user service function which fetches the wallet balance for the user"
      );
      console.log(
        "userId in the user service function fetching the wallet balance:",
        userId
      );

      let fetchedWallet = await this._walletRepository.getWalletByOwnerId(
        userId,
        role
      );

      console.log(`fetched wallet with the ${userId}:`, fetchedWallet);

      if (!fetchedWallet) {
        console.log(`Wallet not found for user ${userId}, creating new wallet`);
        try {
          fetchedWallet = await this._walletRepository.createWallet(
            userId,
            role
          );
          console.log(`Created new wallet for user ${userId}:`, fetchedWallet);
        } catch (createError) {
          console.log("Error creating wallet:", createError);
          return {
            success: false,
            message: "Failed to create wallet",
          };
        }
      }

      return {
        success: true,
        message: "Wallet balance fetched successfully",
        data: {
          balance: fetchedWallet.balance,
        },
      };
    } catch (error) {
      console.log(
        "error occured while fetching the user wallet balance:",
        error
      );
      return {
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  async getAllWalletTransactions(options: {
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
  }> {
    try {
      console.log(
        "entered to the user service fetching all the wallet transactions for the user"
      );
      const page = options.page;
      const limit = options.limit;
      const userId = options.userId;
      const role = options.role;

      const result =
        await this._walletTransactionRepository.getOwnerWalletTransactions({
          page,
          limit,
          ownerId: userId,
          ownerType: role,
        });

      console.log("fetched wallet transactions for the user:", result);
      return {
        success: true,
        message: "User transactions fetched successfully",
        data: {
          transactions: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching user wallet transactions:", error);
      return {
        success: false,
        message: "Something went wrong while fetching user wallet transactions",
      };
    }
  }
}

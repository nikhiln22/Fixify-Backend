// routes/WalletRoutes.ts
import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { WalletController } from "../controllers/walletController";

export class WalletRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const walletController = container.resolve(WalletController);

    // GET /api/wallet/balance - Get wallet balance
    this.router.get(
      "/balance",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      walletController.getWalletBalance.bind(walletController)
    );

    // GET /api/wallet/transactions - Get wallet transactions
    this.router.get(
      "/transactions",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      walletController.getWalletTransactions.bind(walletController)
    );

    // POST /api/wallet/add-money - Add money to wallet
    this.router.post(
      "/add-money",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      walletController.addMoney.bind(walletController)
    );

    // POST /api/wallet/:sessionId/verify-payment - Verify wallet stripe payment
    this.router.post(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      walletController.verifyWalletStripeSession.bind(walletController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

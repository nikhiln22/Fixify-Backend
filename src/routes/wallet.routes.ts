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

    this.router.get(
      "/balance",
      this.authMiddleware.authenticate(Roles.USER, Roles.TECHNICIAN),
      walletController.getWalletBalance.bind(walletController)
    );

    this.router.get(
      "/transactions",
      this.authMiddleware.authenticate(Roles.USER, Roles.TECHNICIAN),
      walletController.getWalletTransactions.bind(walletController)
    );

    this.router.post(
      "/add-money",
      this.authMiddleware.authenticate(Roles.USER),
      walletController.addMoney.bind(walletController)
    );

    this.router.post(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticate(Roles.USER),
      walletController.verifyWalletStripeSession.bind(walletController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

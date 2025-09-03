import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { SubscriptionPlanController } from "../controllers/subscriptionPlanController";

export class SubscriptionPlanRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const subscriptionPlanController = container.resolve(
      SubscriptionPlanController
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      subscriptionPlanController.addSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(
        Roles.ADMIN,
        Roles.TECHNICIAN
      ),
      subscriptionPlanController.getAllSubscriptionPlans.bind(
        subscriptionPlanController
      )
    );

    this.router.put(
      "/:subscriptionPlanId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      subscriptionPlanController.updateSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.patch(
      "/:id/block",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      subscriptionPlanController.blockSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.get(
      "/history",
      this.authMiddleware.authenticateAndCheckStatus(
        Roles.ADMIN,
        Roles.TECHNICIAN
      ),
      subscriptionPlanController.getSubscriptionHistory.bind(
        subscriptionPlanController
      )
    );

    this.router.post(
      "/purchase",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      subscriptionPlanController.purchaseSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.post(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      subscriptionPlanController.verifyStripeSession.bind(
        subscriptionPlanController
      )
    );
  }

  public getRouter() {
    return this.router;
  }
}

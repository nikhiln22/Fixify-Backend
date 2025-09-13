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
      this.authMiddleware.authenticate(Roles.ADMIN),
      subscriptionPlanController.addSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN, Roles.TECHNICIAN),
      subscriptionPlanController.getAllSubscriptionPlans.bind(
        subscriptionPlanController
      )
    );

    this.router.get(
      "/active",
      this.authMiddleware.authenticate(Roles.ADMIN, Roles.TECHNICIAN),
      subscriptionPlanController.getTechnicianActiveSubcriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.put(
      "/:subscriptionPlanId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      subscriptionPlanController.updateSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.patch(
      "/:subscriptionPlanId/block",
      this.authMiddleware.authenticate(Roles.ADMIN),
      subscriptionPlanController.blockSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.get(
      "/history",
      this.authMiddleware.authenticate(Roles.ADMIN, Roles.TECHNICIAN),
      subscriptionPlanController.getSubscriptionhistory.bind(
        subscriptionPlanController
      )
    );

    this.router.post(
      "/purchase",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      subscriptionPlanController.purchaseSubscriptionPlan.bind(
        subscriptionPlanController
      )
    );

    this.router.post(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      subscriptionPlanController.verifyStripeSession.bind(
        subscriptionPlanController
      )
    );
  }

  public getRouter() {
    return this.router;
  }
}

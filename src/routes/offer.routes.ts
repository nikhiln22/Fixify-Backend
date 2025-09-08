import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { OfferController } from "../controllers/offerController";

export class OfferRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const offerController = container.resolve(OfferController);

    this.router.get(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      offerController.getUserOffers.bind(offerController)
    );

    this.router.get(
      "/admin",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      offerController.getAllOffers.bind(offerController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      offerController.addOffer.bind(offerController)
    );

    this.router.put(
      "/:offerId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      offerController.updateOffer.bind(offerController)
    );

    this.router.patch(
      "/:id/block",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      offerController.blockOffer.bind(offerController)
    );

    this.router.post(
      "/apply-best",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      offerController.applyBestOffer.bind(offerController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

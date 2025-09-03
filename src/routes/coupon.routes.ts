import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { CouponController } from "../controllers/couponController";

export class CouponRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const couponController = container.resolve(CouponController);

    this.router.get(
      "/eligible",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      couponController.getEligibleCoupons.bind(couponController)
    );

    this.router.patch(
      "/apply",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      couponController.applyCoupon.bind(couponController)
    );

    this.router.get(
      "/admin",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      couponController.getAllCoupons.bind(couponController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      couponController.addCoupon.bind(couponController)
    );

    this.router.put(
      "/:couponId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      couponController.updateCoupon.bind(couponController)
    );

    this.router.patch(
      "/:id/block",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      couponController.blockCoupon.bind(couponController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

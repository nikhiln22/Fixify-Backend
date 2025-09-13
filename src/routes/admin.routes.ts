import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { AdminController } from "../controllers/adminController";

export class AdminRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const adminController = container.resolve(AdminController);

    this.router.post("/login", adminController.login.bind(adminController));

    this.router.get(
      "/dashboardstats",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getDashboardStats.bind(adminController)
    );

    this.router.get(
      "/bookingsstats",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getBookingStatusDistribution.bind(adminController)
    );

    this.router.get(
      "/revenuetrends",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getRevenueTrends.bind(adminController)
    );

    this.router.get(
      "/servicecategoryperformance",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getServiceCategoryPerformance.bind(adminController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.logout.bind(adminController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

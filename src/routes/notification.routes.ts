// routes/NotificationRoutes.ts
import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { NotificationController } from "../controllers/notificationController";

export class NotificationRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const notificationController = container.resolve(NotificationController);

    this.router.get(
      "/unread",
      this.authMiddleware.authenticateAndCheckStatus(
        Roles.USER,
        Roles.TECHNICIAN,
        Roles.ADMIN
      ),
      notificationController.getAllUnReadNotifications.bind(
        notificationController
      )
    );

    this.router.patch(
      "/:notificationId/read",
      this.authMiddleware.authenticateAndCheckStatus(
        Roles.USER,
        Roles.TECHNICIAN,
        Roles.ADMIN
      ),
      notificationController.markNotificationRead.bind(notificationController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

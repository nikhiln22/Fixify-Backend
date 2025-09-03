import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { TimeSlotController } from "../controllers/timeSlotController";

export class TimeSlotRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const timeSlotController = container.resolve(TimeSlotController);

    this.router.get(
      "/:technicianId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      timeSlotController.getTimeSlots.bind(timeSlotController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

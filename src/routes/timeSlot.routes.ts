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
      "/",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      timeSlotController.getMyTimeSlots.bind(timeSlotController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      timeSlotController.addTimeSlots.bind(timeSlotController)
    );

    this.router.patch(
      "/:slotId/block",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      timeSlotController.blockTimeSlot.bind(timeSlotController)
    );

    this.router.get(
      "/available/:technicianId",
      this.authMiddleware.authenticate(Roles.USER),
      timeSlotController.getAvailableTimeSlots.bind(timeSlotController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

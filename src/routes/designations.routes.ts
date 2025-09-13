import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { DesignationController } from "../controllers/designationController";

export class DesignationRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const designationController = container.resolve(DesignationController);

    this.router.get(
      "/",
      this.authMiddleware.authenticateBasic(Roles.ADMIN, Roles.TECHNICIAN),
      designationController.getAllDesignations.bind(designationController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN),
      designationController.addDesignation.bind(designationController)
    );

    this.router.patch(
      "/:id/status",
      this.authMiddleware.authenticate(Roles.ADMIN),
      designationController.toggleDesignationStatus.bind(designationController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

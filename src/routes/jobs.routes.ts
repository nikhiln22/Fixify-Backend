import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { JobController } from "../controllers/jobController";

export class JobRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const jobController = container.resolve(JobController);

    this.router.get(
      "/designations",
      this.authMiddleware.authenticateAndCheckStatus(
        Roles.ADMIN,
        Roles.TECHNICIAN
      ),
      jobController.getAllDesignations.bind(jobController)
    );

    this.router.post(
      "/designations",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      jobController.addDesignation.bind(jobController)
    );

    this.router.patch(
      "/designations/:id/status",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      jobController.toggleDesignationStatus.bind(jobController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { ApplicantController } from "../controllers/applicantController";

export class ApplicantRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.authMiddleware = AuthMiddleware.getInstance();
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const applicantController = container.resolve(ApplicantController);
    this.router.get(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN),
      applicantController.getAllApplicants.bind(applicantController)
    );

    this.router.get(
      "/:applicantId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      applicantController.getApplicantDetails.bind(applicantController)
    );

    this.router.patch(
      "/:applicantId/approve",
      this.authMiddleware.authenticate(Roles.ADMIN),
      applicantController.approveApplicant.bind(applicantController)
    );

    this.router.delete(
      "/:applicantId/reject",
      this.authMiddleware.authenticate(Roles.ADMIN),
      applicantController.rejectApplicant.bind(applicantController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

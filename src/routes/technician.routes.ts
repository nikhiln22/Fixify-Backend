import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { TechnicianController } from "../controllers/technicianController";

export class TechnicianRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;
  private localUpload: LocalUpload;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.localUpload = new LocalUpload();
    this.setupRoutes();
  }

  private setupRoutes() {
    const technicianController = container.resolve(TechnicianController);

    this.router.post(
      "/register",
      technicianController.register.bind(technicianController)
    );

    this.router.post(
      "/login",
      technicianController.login.bind(technicianController)
    );

    this.router.post(
      "/verify-otp",
      technicianController.verifyOtp.bind(technicianController)
    );

    this.router.post(
      "/resend-otp",
      technicianController.resendOtp.bind(technicianController)
    );

    this.router.post(
      "/forgot-password",
      technicianController.forgotPassword.bind(technicianController)
    );

    this.router.post(
      "/reset-password",
      technicianController.resetPassword.bind(technicianController)
    );

    this.router.get(
      "/logout",
      technicianController.logout.bind(technicianController)
    );

    this.router.get(
      "/dashboardstats",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getDashboardStats.bind(technicianController)
    );

    this.router.get(
      "/technicianearnings",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getTechnicianEarnings.bind(technicianController)
    );

    this.router.get(
      "/servicecategoryrevenue",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getTechnicianServiceCategoriesRevenue.bind(
        technicianController
      )
    );

    this.router.get(
      "/bookingstatusdistribution",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getTechnicianBookingStatusDistribution.bind(
        technicianController
      )
    );

    this.router.get(
      "/me",
      this.authMiddleware.authenticateBasic(Roles.TECHNICIAN),
      technicianController.getProfile.bind(technicianController)
    );

    this.router.get(
      "/reviews",
      this.authMiddleware.authenticateBasic(Roles.TECHNICIAN),
      technicianController.getReviews.bind(technicianController)
    );

    this.router.patch(
      "/qualifications",
      this.authMiddleware.authenticateBasic(Roles.TECHNICIAN),
      this.localUpload.technicianQualificationUpload,
      technicianController.submitQualifications.bind(technicianController)
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN),
      technicianController.getAllTechnicians.bind(technicianController)
    );

    this.router.get(
      "/:technicianId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      technicianController.getTechnicianDetails.bind(technicianController)
    );

    this.router.patch(
      "/:technicianId/block",
      this.authMiddleware.authenticate(Roles.ADMIN),
      technicianController.toggleTechnicianStatus.bind(technicianController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

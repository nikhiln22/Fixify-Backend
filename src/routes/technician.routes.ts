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
      "/login",
      technicianController.login.bind(technicianController)
    );

    this.router.post(
      "/register",
      technicianController.register.bind(technicianController)
    );

    this.router.post(
      "/verifyOtp",
      technicianController.verifyOtp.bind(technicianController)
    );

    this.router.post(
      "/resendotp",
      technicianController.resendOtp.bind(technicianController)
    );

    this.router.post(
      "/forgotpassword",
      technicianController.forgotPassword.bind(technicianController)
    );

    this.router.post(
      "/resetpassword",
      technicianController.resetPassword.bind(technicianController)
    );

    this.router.patch(
      "/qualifications",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      this.localUpload.technicianQualificationUpload,
      technicianController.submitQualifications.bind(technicianController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.logout.bind(technicianController)
    );

    this.router.get(
      "/technicianprofile",
      this.authMiddleware.authenticateAndCheckBlocked(Roles.TECHNICIAN),
      technicianController.getProfile.bind(technicianController)
    );

    this.router.get(
      "/dashboardstats",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getDashboardStats.bind(technicianController)
    );

    this.router.get(
      "/technicianearnings",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianEarnings.bind(technicianController)
    );

    this.router.get(
      "/servicecategoryrevenue",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianServiceCategoriesRevenue.bind(
        technicianController
      )
    );

    this.router.get(
      "/bookingstatusdistribution",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianBookingStatusDistribution.bind(
        technicianController
      )
    );
  }

  public getRouter() {
    return this.router;
  }
}

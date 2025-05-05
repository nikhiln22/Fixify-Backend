import express, { Router } from "express";
import { container } from "../di/container";
import { TechnicianAuthController } from "../controllers/technician/technicianAuthController";
import { TechnicianController } from "../controllers/technician/technicianController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";

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
    const technicianAuthController = container.resolve(
      TechnicianAuthController
    );
    const technicianController = container.resolve(TechnicianController);

    this.router.post(
      "/login",
      technicianAuthController.login.bind(technicianAuthController)
    );

    this.router.post(
      "/register",
      technicianAuthController.register.bind(technicianAuthController)
    );

    this.router.post(
      "/verifyOtp",
      technicianAuthController.verifyOtp.bind(technicianAuthController)
    );

    this.router.post(
      "/resendotp",
      technicianAuthController.resendOtp.bind(technicianAuthController)
    );

    this.router.post(
      "/forgotpassword",
      technicianAuthController.forgotPassword.bind(technicianAuthController)
    );

    this.router.post(
      "/resetpassword",
      technicianAuthController.resetPassword.bind(technicianAuthController)
    );

    this.router.get(
      "/jobdesignations",
      technicianController.getJobDesignations.bind(technicianController)
    );

    this.router.patch(
      "/qualifications",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      this.localUpload.technicianQualificationUpload,
      technicianController.submitQualifications.bind(technicianController)
    );

    this.router.get(
      "/profile",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getProfile.bind(technicianController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianAuthController.logout.bind(technicianAuthController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

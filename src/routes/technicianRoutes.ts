import express, { Router } from "express";
import { container } from "../di/container";
import { TechnicianAuthController } from "../controllers/technician/technicianAuthController";

export class TechnicianRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const technicianAuthController = container.resolve(TechnicianAuthController);

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
  }

  public getRouter() {
    return this.router;
  }
}

import express, { Router } from "express";
import { container } from "../di/container";
import { UserAuthController } from "../controllers/user/userAuthController";

export class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const userAuthController = container.resolve(UserAuthController);

    this.router.post(
      "/login",
      userAuthController.login.bind(userAuthController)
    );

    this.router.post(
      "/register",
      userAuthController.register.bind(userAuthController)
    );

    this.router.post(
      "/verifyOtp",
      userAuthController.verifyOtp.bind(userAuthController)
    );

    this.router.post(
      "/resendotp",
      userAuthController.resendOtp.bind(userAuthController)
    );

    this.router.post(
      "/forgotpassword",
      userAuthController.forgotPassword.bind(userAuthController)
    );

    this.router.post(
      "/resetpassword",
      userAuthController.resetPassword.bind(userAuthController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

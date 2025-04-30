import express, { Router } from "express";
import { container } from "../di/container";
import { UserAuthController } from "../controllers/user/userAuthController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";

export class UserRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
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

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.USER),
      userAuthController.logout.bind(userAuthController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

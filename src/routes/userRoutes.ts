import express, { Router } from "express";
import { container } from "../di/container";
import { UserController } from "../controllers/userController";
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
    const userController = container.resolve(UserController);

    this.router.post(
      "/login",
      userController.login.bind(userController)
    );

    this.router.get(
      "/checkstatus",
      this.authMiddleware.authenticate(Roles.USER),
      userController.checkUserStatus.bind(userController)
    );

    this.router.post(
      "/register",
      userController.register.bind(userController)
    );

    this.router.post(
      "/verifyOtp",
      userController.verifyOtp.bind(userController)
    );

    this.router.post(
      "/resendotp",
      userController.resendOtp.bind(userController)
    );

    this.router.post(
      "/forgotpassword",
      userController.forgotPassword.bind(userController)
    );

    this.router.post(
      "/resetpassword",
      userController.resetPassword.bind(userController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.USER),
      userController.logout.bind(userController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

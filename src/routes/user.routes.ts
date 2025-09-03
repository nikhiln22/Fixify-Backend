import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { UserController } from "../controllers/userController";

export class UserRoutes {
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
    const userController = container.resolve(UserController);

    this.router.post("/login", userController.login.bind(userController));
    this.router.post("/register", userController.register.bind(userController));
    this.router.post(
      "/verify-otp",
      userController.verifyOtp.bind(userController)
    );
    this.router.post(
      "/resend-otp",
      userController.resendOtp.bind(userController)
    );
    this.router.post(
      "/forgot-password",
      userController.forgotPassword.bind(userController)
    );
    this.router.post(
      "/reset-password",
      userController.resetPassword.bind(userController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.USER),
      userController.logout.bind(userController)
    );

    this.router.get(
      "/profile",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getProfile.bind(userController)
    );

    this.router.put(
      "/updateprofile",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      this.localUpload.upload.single("image"),
      userController.editProfile.bind(userController)
    );

    this.router.get(
      "/technicians",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getNearbyTechnicians.bind(userController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

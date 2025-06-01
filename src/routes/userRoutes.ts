import express, { Router } from "express";
import { container } from "../di/container";
import { UserController } from "../controllers/userController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";

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
      "/categories",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getAllCategories.bind(userController)
    );

    this.router.get(
      "/services",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getAllServices.bind(userController)
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
      "/address",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getAddress.bind(userController)
    );

    this.router.post(
      "/addaddress",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.addAddress.bind(userController)
    );

    this.router.delete(
      "/deleteaddress/:addressId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.deleteAddress.bind(userController)
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

import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { AddressController } from "../controllers/addressController";

export class AddressRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const addressController = container.resolve(AddressController);

    this.router.get(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      addressController.getAddress.bind(addressController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      addressController.addAddress.bind(addressController)
    );

    this.router.delete(
      "/:addressId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      addressController.deleteAddress.bind(addressController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

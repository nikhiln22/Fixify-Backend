import express, { Router } from "express";
import { AuthController } from "../controllers/authController";
import { container } from "tsyringe";

export class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const authController = container.resolve(AuthController);

    this.router.get(
      "/refreshtoken",
      authController.newAccessToken.bind(authController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

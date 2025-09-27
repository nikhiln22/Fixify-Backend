import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { PartController } from "../controllers/partController";

export class PartsRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const partController = container.resolve(PartController);

    this.router.get(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN, Roles.TECHNICIAN),
      partController.getAllParts.bind(partController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticate(Roles.ADMIN),
      partController.addPart.bind(partController)
    );

    this.router.patch(
      "/:partId/status",
      this.authMiddleware.authenticate(Roles.ADMIN),
      partController.togglePartStatus.bind(partController)
    );

    this.router.put(
      "/:partId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      partController.updatePart.bind(partController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

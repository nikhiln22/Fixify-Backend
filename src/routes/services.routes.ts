import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { ServiceController } from "../controllers/serviceController";

export class ServiceRoutes {
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
    const serviceController = container.resolve(ServiceController);

    this.router.get(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      serviceController.getAllServices.bind(serviceController)
    );

    this.router.get(
      "/most-booked",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      serviceController.getMostBookedServices.bind(serviceController)
    );

    this.router.get(
      "/:serviceId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      serviceController.getServiceDetails.bind(serviceController)
    );

    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.addService.bind(serviceController)
    );

    this.router.put(
      "/:serviceId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.editService.bind(serviceController)
    );

    this.router.patch(
      "/:serviceId/status",
      this.authMiddleware.authenticateAndCheckStatus(Roles.ADMIN),
      serviceController.toggleServiceStatus.bind(serviceController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

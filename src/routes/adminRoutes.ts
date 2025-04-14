import express, { Router } from "express";
import { container } from "../di/container";
import { AdminAuthController } from "../controllers/admin/adminAuthController";
import { JobDesignationController } from "../controllers/admin/jobDesignationController";

export class AdminRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const adminAuthController = container.resolve(AdminAuthController);
    const jobDesignationController = container.resolve(
      JobDesignationController
    );

    this.router.post(
      "/login",
      adminAuthController.login.bind(adminAuthController)
    );

    this.router.post(
      "/jobdesignation",
      jobDesignationController.addDesignation.bind(jobDesignationController)
    );

    this.router.put(
      "/jobdesignation/block/:id",
      jobDesignationController.blockDesignation.bind(jobDesignationController)
    );

    this.router.get(
      "/jobdesignations",
      jobDesignationController.getAllDesignations.bind(jobDesignationController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

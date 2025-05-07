import express, { Router } from "express";
import { container } from "../di/container";
import { AdminAuthController } from "../controllers/admin/adminAuthController";
import { JobDesignationController } from "../controllers/admin/jobDesignationController";
import { UserManagementController } from "../controllers/admin/userManagementController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { ApplicantManagementController } from "../controllers/admin/applicantManagementController";

export class AdminRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const adminAuthController = container.resolve(AdminAuthController);
    const jobDesignationController = container.resolve(
      JobDesignationController
    );

    const userManagementController = container.resolve(
      UserManagementController
    );

    const applicantManagementController = container.resolve(
      ApplicantManagementController
    );

    this.router.post(
      "/login",
      adminAuthController.login.bind(adminAuthController)
    );

    this.router.post(
      "/addjobdesignation",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobDesignationController.addDesignation.bind(jobDesignationController)
    );

    this.router.patch(
      "/blockjobdesignation/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobDesignationController.toggleDesignationStatus.bind(
        jobDesignationController
      )
    );

    this.router.get(
      "/jobdesignations",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobDesignationController.getAllDesignations.bind(jobDesignationController)
    );

    this.router.get(
      "/userslist",
      this.authMiddleware.authenticate(Roles.ADMIN),
      userManagementController.getAllPaginatedUsers.bind(
        userManagementController
      )
    );

    this.router.patch(
      "/blockuser/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      userManagementController.toggleUserStatus.bind(userManagementController)
    );

    this.router.get(
      "/applicantslist",
      this.authMiddleware.authenticate(Roles.ADMIN),
      applicantManagementController.getAllPaginatedApplicants.bind(
        applicantManagementController
      )
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminAuthController.logout.bind(adminAuthController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

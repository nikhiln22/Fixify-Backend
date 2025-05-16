import express, { Router } from "express";
import { container } from "../di/container";
import { AdminAuthController } from "../controllers/admin/adminAuthController";
import { JobDesignationController } from "../controllers/admin/jobDesignationController";
import { UserManagementController } from "../controllers/admin/userManagementController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { ApplicantManagementController } from "../controllers/admin/applicantManagementController";
import { CategoryManagementController } from "../controllers/admin/categoryManagementController";
import { LocalUpload } from "../config/multerConfig";
import { ServiceManagementController } from "../controllers/admin/serviceManagementController";

export class AdminRoutes {
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

    const catagoryManagementController = container.resolve(
      CategoryManagementController
    );

    const serviceManagementController = container.resolve(
      ServiceManagementController
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
      "/categories",
      this.authMiddleware.authenticate(Roles.ADMIN),
      catagoryManagementController.getAllCategory.bind(
        catagoryManagementController
      )
    );

    this.router.post(
      "/addcategory",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      catagoryManagementController.addCategory.bind(
        catagoryManagementController
      )
    );

    this.router.patch(
      "/blockcategory/:categoryId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      catagoryManagementController.toggleCategoryStatus.bind(
        catagoryManagementController
      )
    );

    this.router.put(
      "/updatecategory/:categoryId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      catagoryManagementController.editCategory.bind(
        catagoryManagementController
      )
    );

    this.router.get(
      "/services",
      this.authMiddleware.authenticate(Roles.ADMIN),
      serviceManagementController.getAllServices.bind(
        serviceManagementController
      )
    );

    this.router.post(
      "/addservice",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceManagementController.addService.bind(serviceManagementController)
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

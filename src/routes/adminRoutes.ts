import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { IAdminController } from "../interfaces/Icontrollers/IadminController";
import { IServiceController } from "../interfaces/Icontrollers/IserviceController";
import { IJobController } from "../interfaces/Icontrollers/IjobController";

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
    const jobController = container.resolve<IJobController>("IJobController");

    const serviceController =
      container.resolve<IServiceController>("IServiceController");

    const adminController =
      container.resolve<IAdminController>("IAdminController");

    this.router.post("/login", adminController.login.bind(adminController));

    this.router.post(
      "/addjobdesignation",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobController.addDesignation.bind(jobController)
    );

    this.router.patch(
      "/blockjobdesignation/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobController.toggleDesignationStatus.bind(jobController)
    );

    this.router.get(
      "/jobdesignations",
      this.authMiddleware.authenticate(Roles.ADMIN),
      jobController.getAllDesignations.bind(jobController)
    );

    this.router.get(
      "/userslist",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllUsers.bind(adminController)
    );

    this.router.get(
      "/technicianslist",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllTechnicians.bind(adminController)
    );

    this.router.patch(
      "/blocktechnician/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.toggleTechnicianStatus.bind(adminController)
    );

    this.router.patch(
      "/blockuser/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.toggleUserStatus.bind(adminController)
    );

    this.router.get(
      "/applicantslist",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllApplicants.bind(adminController)
    );

    this.router.patch(
      "/verifyapplicant/:applicantId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.verifyApplicant.bind(adminController)
    );

    this.router.delete(
      "/rejectapplicant/:applicantId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.rejectApplicant.bind(adminController)
    );

    this.router.get(
      "/technicianprofile/:technicianId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getTechnicianProfile.bind(adminController)
    );

    this.router.get(
      "/categories",
      this.authMiddleware.authenticate(Roles.ADMIN),
      serviceController.getAllCategory.bind(serviceController)
    );

    this.router.post(
      "/addcategory",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.addCategory.bind(serviceController)
    );

    this.router.patch(
      "/blockcategory/:categoryId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      serviceController.toggleCategoryStatus.bind(serviceController)
    );

    this.router.put(
      "/updatecategory/:categoryId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.editCategory.bind(serviceController)
    );

    this.router.get(
      "/services",
      this.authMiddleware.authenticate(Roles.ADMIN),
      serviceController.getAllServices.bind(serviceController)
    );

    this.router.post(
      "/addservice",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.addService.bind(serviceController)
    );

    this.router.patch(
      "/blockservice/:serviceId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      serviceController.toggleServiceStatus.bind(serviceController)
    );

    this.router.put(
      "/updateservice/:serviceId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      this.localUpload.upload.single("image"),
      serviceController.editService.bind(serviceController)
    );

    this.router.get(
      "/bookings",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllBookings.bind(adminController)
    );

    this.router.get(
      "/bookingdetails/:bookingId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getBookingDetails.bind(adminController)
    );

    this.router.post(
      "/addoffer",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.addOffer.bind(adminController)
    );

    this.router.get(
      "/offers",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllOffers.bind(adminController)
    );

    this.router.patch(
      "/blockoffer/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.blockOffer.bind(adminController)
    );

    this.router.put(
      "/updateoffer/:offerId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.updateOffer.bind(adminController)
    );

    this.router.post(
      "/addcoupon",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.addCoupon.bind(adminController)
    );

    this.router.get(
      "/coupons",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllCoupons.bind(adminController)
    );

    this.router.patch(
      "/blockcoupon/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.blockCoupon.bind(adminController)
    );

    this.router.put(
      "/updatecoupon/:couponId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.updateCoupon.bind(adminController)
    );

    this.router.get(
      "/rating/:bookingId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getRating.bind(adminController)
    );

    this.router.post(
      "/addsubscriptionplan",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.addSubscriptionPlan.bind(adminController)
    );

    this.router.get(
      "/subscriptionplans",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getAllSubscriptionPlans.bind(adminController)
    );

    this.router.patch(
      "/blocksubscriptionplan/:id",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.blockSubscriptionPlan.bind(adminController)
    );

    this.router.put(
      "/updatesubscriptionplan/:subscriptionPlanId",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.updateSubscriptionPlan.bind(adminController)
    );

    this.router.get(
      "/subscriptionhistory",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.getSubscriptionhistory.bind(adminController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.ADMIN),
      adminController.logout.bind(adminController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

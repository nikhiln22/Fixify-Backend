import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";
import { ITechnicianController } from "../interfaces/Icontrollers/ItechnicianController";

export class TechnicianRoutes {
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
    const technicianController = container.resolve<ITechnicianController>(
      "ITechnicianController"
    );

    this.router.post(
      "/login",
      technicianController.login.bind(technicianController)
    );

    this.router.post(
      "/register",
      technicianController.register.bind(technicianController)
    );

    this.router.post(
      "/verifyOtp",
      technicianController.verifyOtp.bind(technicianController)
    );

    this.router.post(
      "/resendotp",
      technicianController.resendOtp.bind(technicianController)
    );

    this.router.post(
      "/forgotpassword",
      technicianController.forgotPassword.bind(technicianController)
    );

    this.router.post(
      "/resetpassword",
      technicianController.resetPassword.bind(technicianController)
    );

    this.router.get(
      "/jobdesignations",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getJobDesignations.bind(technicianController)
    );

    this.router.patch(
      "/qualifications",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      this.localUpload.technicianQualificationUpload,
      technicianController.submitQualifications.bind(technicianController)
    );

    this.router.get(
      "/profile",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getProfile.bind(technicianController)
    );

    this.router.get(
      "/timeslot",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getTimeSlots.bind(technicianController)
    );

    this.router.post(
      "/addtimeslot",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.addTimeSlots.bind(technicianController)
    );

    this.router.patch(
      "/blockslot/:slotId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.blockTimeSlot.bind(technicianController)
    );

    this.router.get(
      "/bookings",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getAllBookings.bind(technicianController)
    );

    this.router.get(
      "/bookingdetails/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getBookingDetails.bind(technicianController)
    );

    this.router.get(
      "/chatmessages/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getChatHistory.bind(technicianController)
    );

    this.router.post(
      "/sendchatmessages/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.sendChat.bind(technicianController)
    );

    this.router.post(
      "/generatecompletionotp/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.generateCompletionOtp.bind(technicianController)
    );

    this.router.post(
      "/verifycompletionotp/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.verifyCompletionOtp.bind(technicianController)
    );

    this.router.get(
      "/walletbalance",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getWalletBalance.bind(technicianController)
    );

    this.router.get(
      "/wallettransactions",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getWalletTransactions.bind(technicianController)
    );

    this.router.put(
      "/cancelbooking/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.cancelBooking.bind(technicianController)
    );

    this.router.get(
      "/reviews",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.getReviews.bind(technicianController)
    );

    this.router.get(
      "/rating/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getRating.bind(technicianController)
    );

    this.router.get(
      "/subscription",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getMySubscription.bind(technicianController)
    );

    this.router.get(
      "/subscriptionplans",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getAllSubscriptionPlans.bind(technicianController)
    );

    this.router.get(
      "/subscriptionhistory",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getSubscriptionHistory.bind(technicianController)
    );

    this.router.post(
      "/purchaseplan",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.purchaseSubscriptionPlan.bind(technicianController)
    );

    this.router.post(
      "/verifypurchase/:sessionId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.verifyStripeSession.bind(technicianController)
    );

    this.router.get(
      "/notifications",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getNotifications.bind(technicianController)
    );

    this.router.get(
      "/unreadnotifications",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      technicianController.getUnreadNotificationCount.bind(technicianController)
    );

    this.router.patch(
      "/readnotification/:notificationId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      technicianController.markNotificationRead.bind(technicianController)
    );

    this.router.get(
      "/dashboardstats",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getDashboardStats.bind(technicianController)
    );

    this.router.get(
      "/technicianearnings",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianEarnings.bind(technicianController)
    );

    this.router.get(
      "/servicecategoryrevenue",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianServiceCategoriesRevenue.bind(
        technicianController
      )
    );

    this.router.get(
      "/bookingstatusdistribution",
      this.authMiddleware.authenticateAndCheckStatus(Roles.TECHNICIAN),
      technicianController.getTechnicianBookingStatusDistribution.bind(
        technicianController
      )
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.logout.bind(technicianController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

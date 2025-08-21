import express, { Router } from "express";
import { container } from "../di/container";
import { IUserController } from "../interfaces/Icontrollers/IuserController";
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
    const userController =
      container.resolve<IUserController>("IUserController");

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
      "/servicedetails/:serviceId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getServiceDetails.bind(userController)
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
      "/technicians",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getNearbyTechnicians.bind(userController)
    );

    this.router.get(
      "/timeslots/:technicianId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getTimeSlots.bind(userController)
    );

    this.router.post(
      "/bookservice",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.bookService.bind(userController)
    );

    this.router.get(
      "/verifypayment/:sessionId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.verifyStripeSession.bind(userController)
    );

    this.router.get(
      "/bookings",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getAllBookings.bind(userController)
    );

    this.router.get(
      "/bookingdetails/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getBookingDetails.bind(userController)
    );

    this.router.post(
      "/addmoney",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.addMoney.bind(userController)
    );

    this.router.get(
      "/verifywalletsession/:sessionId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.verifyWalletStripeSession.bind(userController)
    );

    this.router.get(
      "/walletbalance",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getWalletBalance.bind(userController)
    );

    this.router.get(
      "/wallettransactions",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getWalletTransactions.bind(userController)
    );

    this.router.get(
      "/chatmessages/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getChatHistory.bind(userController)
    );

    this.router.post(
      "/sendchatmessages/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.sendChat.bind(userController)
    );

    this.router.put(
      "/cancelbooking/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.cancelBooking.bind(userController)
    );

    this.router.post(
      "/rateservice/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.rateService.bind(userController)
    );

    this.router.get(
      "/rating/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getRating.bind(userController)
    );

    this.router.get(
      "/mostbooked",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getMostBookedServices.bind(userController)
    );

    this.router.get(
      "/offers",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getOffers.bind(userController)
    );

    this.router.post(
      "/applybestoffer",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.applyBestOffer.bind(userController)
    );

    this.router.get(
      "/coupons",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getEligibleCoupons.bind(userController)
    );

    this.router.post(
      "/applycoupon",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.applyCoupon.bind(userController)
    );

    this.router.get(
      "/notifications",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getNotifications.bind(userController)
    );

    this.router.get(
      "/unreadnotifications",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.getUnreadNotificationCount.bind(userController)
    );

    this.router.patch(
      "/readnotification/:notificationId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.markNotificationRead.bind(userController)
    );

    this.router.get(
      "/logout",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      userController.logout.bind(userController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

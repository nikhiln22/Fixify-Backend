import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { BookingController } from "../controllers/bookingController";

export class BookingRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const bookingController = container.resolve(BookingController);

    this.router.post(
      "/",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.bookService.bind(bookingController)
    );

    this.router.get(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.verifyStripeSession.bind(bookingController)
    );

    this.router.get(
      "/",
      this.authMiddleware.authenticate(
        Roles.USER,
        Roles.TECHNICIAN,
        Roles.ADMIN
      ),
      bookingController.getAllBookings.bind(bookingController)
    );

    this.router.get(
      "/:bookingId",
      this.authMiddleware.authenticate(
        Roles.USER,
        Roles.TECHNICIAN,
        Roles.ADMIN
      ),
      bookingController.getBookingDetails.bind(bookingController)
    );

    this.router.patch(
      "/:bookingId/cancel",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.cancelBooking.bind(bookingController)
    );

    this.router.patch(
      "/:bookingId/start",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      bookingController.startService.bind(bookingController)
    );

    this.router.post(
      "/:bookingId/generate-completion-otp",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      bookingController.generateBookingCompletionOtp.bind(bookingController)
    );

    this.router.post(
      "/:bookingId/verify-completion-otp",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      bookingController.verifyBookingCompletionOtp.bind(bookingController)
    );

    this.router.post(
      "/:bookingId/rate",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.rateService.bind(bookingController)
    );

    this.router.get(
      "/:bookingId/rating",
      this.authMiddleware.authenticate(
        Roles.USER,
        Roles.TECHNICIAN,
        Roles.ADMIN
      ),
      bookingController.getRating.bind(bookingController)
    );

    this.router.post(
      "/:bookingId/add-parts",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      bookingController.addReplacementParts.bind(bookingController)
    );

    this.router.get(
      "/:bookingId/replacement-parts",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.getReplacementPartsForApproval.bind(bookingController)
    );

    this.router.patch(
      "/:bookingId/parts-approval",
      this.authMiddleware.authenticate(Roles.USER),
      bookingController.approveReplacementParts.bind(bookingController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

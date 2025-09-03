// routes/BookingRoutes.ts
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

    // GET /api/bookings - Get all bookings
    this.router.get(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.getAllBookings.bind(bookingController)
    );

    // POST /api/bookings - Book a service
    this.router.post(
      "/",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.bookService.bind(bookingController)
    );

    // GET /api/bookings/:bookingId - Get booking details
    this.router.get(
      "/:bookingId",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.getBookingDetails.bind(bookingController)
    );

    // PATCH /api/bookings/:bookingId/cancel - Cancel booking
    this.router.patch(
      "/:bookingId/cancel",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.cancelBooking.bind(bookingController)
    );

    // POST /api/bookings/:sessionId/verify-payment - Verify stripe payment
    this.router.post(
      "/:sessionId/verify-payment",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.verifyStripeSession.bind(bookingController)
    );

    // POST /api/bookings/:bookingId/rate - Rate a completed booking
    this.router.post(
      "/:bookingId/rate",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.rateService.bind(bookingController)
    );

    // GET /api/bookings/:bookingId/rating - Get rating for a booking
    this.router.get(
      "/:bookingId/rating",
      this.authMiddleware.authenticateAndCheckStatus(Roles.USER),
      bookingController.getRating.bind(bookingController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

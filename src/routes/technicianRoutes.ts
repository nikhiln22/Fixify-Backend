import express, { Router } from "express";
import { container } from "../di/container";
import { TechnicianController } from "../controllers/technicianController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { LocalUpload } from "../config/multerConfig";

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
    const technicianController = container.resolve(TechnicianController);

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

    this.router.post(
      "/generatecompletionotp/:bookingId",
      this.authMiddleware.authenticate(Roles.TECHNICIAN),
      technicianController.generateCompletionOtp.bind(technicianController)
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

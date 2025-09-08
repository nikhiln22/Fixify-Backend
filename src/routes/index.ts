import { Express, Request, Response } from "express";
import { UserRoutes } from "./user.routes";
import { AdminRoutes } from "./admin.routes";
import { TechnicianRoutes } from "./technician.routes";
import { AuthRoutes } from "./auth.routes";
import { CategoryRoutes } from "./categories.routes";
import { ServiceRoutes } from "./services.routes";
import { AddressRoutes } from "./address.routes";
import { BookingRoutes } from "./booking.routes";
import { WalletRoutes } from "./wallet.routes";
import { OfferRoutes } from "./offer.routes";
import { CouponRoutes } from "./coupon.routes";
import { NotificationRoutes } from "./notification.routes";
import { JobRoutes } from "./jobs.routes";
import { TimeSlotRoutes } from "./timeSlot.routes";
import { SubscriptionPlanRoutes } from "./subscriptionPlan.routes";

export class RouteRegistry {
  public static registerRoutes(app: Express): void {
    const authRoutes = new AuthRoutes();
    app.use("/api/auth", authRoutes.getRouter());

    const userRoutes = new UserRoutes();
    const addressRoutes = new AddressRoutes();
    const walletRoutes = new WalletRoutes();
    const notificationRoutes = new NotificationRoutes();
    app.use("/api/users", userRoutes.getRouter());
    app.use("/api/addresses", addressRoutes.getRouter());
    app.use("/api/wallet", walletRoutes.getRouter());
    app.use("/api/notifications", notificationRoutes.getRouter());

    const categoryRoutes = new CategoryRoutes();
    const serviceRoutes = new ServiceRoutes();
    const bookingRoutes = new BookingRoutes();
    const jobRoutes = new JobRoutes();
    const timeSlotRoutes = new TimeSlotRoutes();
    app.use("/api/categories", categoryRoutes.getRouter());
    app.use("/api/services", serviceRoutes.getRouter());
    app.use("/api/bookings", bookingRoutes.getRouter());
    app.use("/api/jobs", jobRoutes.getRouter());
    app.use("/api/timeslots", timeSlotRoutes.getRouter());

    const offerRoutes = new OfferRoutes();
    const couponRoutes = new CouponRoutes();
    const subscriptionPlanRoutes = new SubscriptionPlanRoutes();
    app.use("/api/offers", offerRoutes.getRouter());
    app.use("/api/coupons", couponRoutes.getRouter());
    app.use("/api/subscription-plans", subscriptionPlanRoutes.getRouter());

    const adminRoutes = new AdminRoutes();
    const technicianRoutes = new TechnicianRoutes();
    app.use("/api/admin", adminRoutes.getRouter());
    app.use("/api/technician", technicianRoutes.getRouter());

    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ message: "backend is running..." });
    });
  }
}

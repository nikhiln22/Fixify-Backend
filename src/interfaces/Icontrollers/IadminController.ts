import { Request, Response } from "express";

export interface IAdminController {
  login(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  toggleUserStatus(req: Request, res: Response): Promise<void>;
  getAllApplicants(req: Request, res: Response): Promise<void>;
  getTechnicianProfile(req: Request, res: Response): Promise<void>;
  verifyApplicant(req: Request, res: Response): Promise<void>;
  rejectApplicant(req: Request, res: Response): Promise<void>;
  getAllTechnicians(req: Request, res: Response): Promise<void>;
  toggleTechnicianStatus(req: Request, res: Response): Promise<void>;
  getAllBookings(req: Request, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
  addOffer(req: Request, res: Response): Promise<void>;
  getAllOffers(req: Request, res: Response): Promise<void>;
  blockOffer(req: Request, res: Response): Promise<void>;
  updateOffer(req: Request, res: Response): Promise<void>;
  addCoupon(req: Request, res: Response): Promise<void>;
  getAllCoupons(req: Request, res: Response): Promise<void>;
  blockCoupon(req: Request, res: Response): Promise<void>;
  updateCoupon(req: Request, res: Response): Promise<void>;
  getRating(req: Request, res: Response): Promise<void>;
  addSubscriptionPlan(req: Request, res: Response): Promise<void>;
  getAllSubscriptionPlans(req: Request, res: Response): Promise<void>;
  blockSubscriptionPlan(req: Request, res: Response): Promise<void>;
  updateSubscriptionPlan(req: Request, res: Response): Promise<void>;
  getSubscriptionhistory(req: Request, res: Response): Promise<void>;
  getDashboardStats(req: Request, res: Response): Promise<void>;
  getBookingStatusDistribution(req: Request, res: Response): Promise<void>;
  getRevenueTrends(req: Request, res: Response): Promise<void>;
  getServiceCategoryPerformance(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

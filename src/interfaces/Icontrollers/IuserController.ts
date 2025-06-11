import { Request, Response } from "express";

export interface IuserController {
  register(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  getAllCategories(req: Request, res: Response): Promise<void>;
  getAllServices(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
  editProfile(req: Request, res: Response): Promise<void>;
  getAddress(req: Request, res: Response): Promise<void>;
  addAddress(req: Request, res: Response): Promise<void>;
  deleteAddress(req: Request, res: Response): Promise<void>;
  getServiceDetails(req: Request, res: Response): Promise<void>;
  getNearbyTechnicians(req: Request, res: Response): Promise<void>;
  getTimeSlots(req: Request, res: Response): Promise<void>;
  bookService(req: Request, res: Response): Promise<void>;
  getAllBookings(req: Request, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

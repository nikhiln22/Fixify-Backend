import { Request, Response } from "express";

export interface ItechnicianController {
  register(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  submitQualifications(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
  getJobDesignations(req: Request, res: Response): Promise<void>;
  getTimeSlots(req: Request, res: Response): Promise<void>;
  addTimeSlots(req: Request, res: Response): Promise<void>;
  blockTimeSlot(req: Request, res: Response): Promise<void>;
  getAllBookings(req: Request, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

import { Request, Response } from "express";

export interface ITechnicianController {
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
  generateCompletionOtp(req: Request, res: Response): Promise<void>;
  verifyCompletionOtp(req: Request, res: Response): Promise<void>;
  getWalletBalance(req: Request, res: Response): Promise<void>;
  getWalletTransactions(req: Request, res: Response): Promise<void>;
  getChatHistory(req: Request, res: Response): Promise<void>;
  sendChat(req: Request, res: Response): Promise<void>;
  cancelBooking(req: Request, res: Response): Promise<void>;
  getReviews(req: Request, res: Response): Promise<void>;
  getRating(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

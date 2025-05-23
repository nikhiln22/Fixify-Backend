import { Request, Response } from "express";

export interface IuserController {
  register(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  forgotPassword(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  checkUserStatus(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

import { Request, Response } from "express";

export interface IadminController {
  login(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  toggleUserStatus(req: Request, res: Response): Promise<void>;
  getAllApplicants(req: Request, res: Response): Promise<void>;
  getTechnicianProfile(req: Request, res: Response): Promise<void>;
  verifyApplicant(req: Request, res: Response): Promise<void>;
  rejectApplicant(req: Request, res: Response): Promise<void>;
  getAllTechnicians(req: Request, res: Response): Promise<void>;
  toggleTechnicianStatus(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

import { Request, Response } from "express";

export interface IuserManagementController {
  getAllUsers(req: Request, res: Response): Promise<void>;
  toggleUserStatus(req: Request, res: Response): Promise<void>;
}

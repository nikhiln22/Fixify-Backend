import { Request, Response } from "express";

export interface IadminController {
  login(req: Request, res: Response): Promise<void>;
  getAllUsers(req: Request, res: Response): Promise<void>;
  toggleUserStatus(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}

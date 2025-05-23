import { Request, Response } from "express";

export interface IauthController {
  refreshAccessToken(req: Request, res: Response): Promise<void>;
}
import { Request, Response } from "express";

export interface IcommonController {
  refreshAccessToken(req: Request, res: Response): Promise<void>;
}

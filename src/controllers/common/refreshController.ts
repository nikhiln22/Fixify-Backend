import { IcommonController } from "../../interfaces/Icontrollers/Icommoncontrollers/Icommoncontroller";
import { inject, injectable } from "tsyringe";
import { IrefreshService } from "../../interfaces/Iservices/IcommonService/IrefreshService";
import { Request, Response } from "express";

@injectable()
export class RefreshController implements IcommonController {
  constructor(
    @inject("IrefreshService") private refreshService: IrefreshService
  ) {}

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ message: "Role is required in the body" });
        return;
      }

      const refreshToken = req.cookies?.[`${role}_refresh_token`];

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token not found in cookies" });
        return;
      }

      const newAccessToken = await this.refreshService.refreshAccessToken(
        refreshToken,
        role
      );

      res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken: newAccessToken,
      });
    } catch (error: any) {
      console.error("Error in refreshAccessToken controller:", error.message);
      res.status(500).json({ message: "Failed to refresh access token" });
    }
  }
}

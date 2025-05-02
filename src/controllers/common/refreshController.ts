import { IcommonController } from "../../interfaces/Icontrollers/Icommoncontrollers/Icommoncontroller";
import { inject, injectable } from "tsyringe";
import { IrefreshService } from "../../interfaces/Iservices/IcommonService/IrefreshService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";

@injectable()
export class RefreshController implements IcommonController {
  constructor(
    @inject("IrefreshService") private refreshService: IrefreshService
  ) {}

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the access token generating with the existing refresh token");
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ message: "Role is required in the body" });
        return;
      }

      const refreshToken = req.cookies?.[`${role}_refresh_token`];
      console.log("refresh token from the refresh controller",refreshToken);

      if (!refreshToken) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Refresh token not found in cookies" });
        return;
      }

      const newAccessToken = await this.refreshService.refreshAccessToken(
        refreshToken,
        role
      );

      res.status(HTTP_STATUS.OK).json({
        success:true,
        message: "Access token refreshed successfully",
        access_token: newAccessToken,
      });
    } catch (error: any) {
      console.error("Error in refreshAccessToken controller:", error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Failed to refresh access token" });
    }
  }
}

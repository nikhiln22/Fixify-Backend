import { injectable, inject } from "tsyringe";
import { IadminAuthController } from "../../interfaces/Icontrollers/Iadmincontrollers/IadminAuthController";
import { Request, Response } from "express";
import { IadminService } from "../../interfaces/Iservices/IadminService/IadminAuthService";
import { HTTP_STATUS } from "../../utils/httpStatus";

@injectable()
export class AdminAuthController implements IadminAuthController {
  constructor(@inject("IadminService") private adminService: IadminService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin controller function fro admin login");
      const data = req.body;
      console.log("data:", data);
      const response = await this.adminService.adminLogin(data);
      console.log("response from the admin login controller:", response);

      res.cookie(
        `${response.role?.toLowerCase()}_refresh_token`,
        response.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );

      if (response.success) {
        res
          .status(response.status)
          .json({
            success: response.success,
            message: response.message,
            data: response,
          });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error occured while logging the admin:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the logout function from the admin auth controller");
      const role = (req as any).user?.role;
      console.log("role in the admin auth controller:", role);
      res.clearCookie(`${role}_refresh_token`, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.log("error occured while admin logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }
}

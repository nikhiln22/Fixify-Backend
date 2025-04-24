import { injectable, inject } from "tsyringe";
import { IadminAuthController } from "../../interfaces/Icontrollers/IadminAuthController";
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
      if (response.success) {
        res
          .status(HTTP_STATUS.OK)
          .json({ success: true, message: response.message, data: response });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log("error occured while logging the admin:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}

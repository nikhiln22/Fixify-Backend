import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IadminController } from "../interfaces/Icontrollers/IadminController";
import { inject, injectable } from "tsyringe";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { IadminService } from "../interfaces/Iservices/IadminService";

@injectable()
export class AdminController implements IadminController {
  constructor(
    @inject("IuserService")
    private userService: IuserService,
    @inject("IadminService")
    private adminService: IadminService,
  ) {}

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

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await this.userService.getAllUsers({
        page,
        limit,
        search,
        status
      });

      console.log("result from the fetching all users controller:", result);
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const response = await this.userService.toggleUserStatus(id);

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
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

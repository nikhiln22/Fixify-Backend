import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IuserManagementController } from "../../interfaces/Icontrollers/Iadmincontrollers/IuserManagementController";
import { inject, injectable } from "tsyringe";
import { IuserManagementService } from "../../interfaces/Iservices/IadminService/IuserManagementService";

@injectable()
export class UserManagementController implements IuserManagementController {
  constructor(
    @inject("IuserManagementService")
    private userManagementService: IuserManagementService
  ) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.userManagementService.getAllUsers({
        page,
        limit,
        search,
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

      const response = await this.userManagementService.toggleUserStatus(id);

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }
}

import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IuserManagemenrController } from "../../interfaces/Icontrollers/IuserManagementController";
import { inject, injectable } from "tsyringe";
import { IuserManagementService } from "../../interfaces/Iservices/IuserManagementService";

@injectable()
export class UserManagementController implements IuserManagemenrController {
  constructor(
    @inject("IuserManagementService")
    private userManagementService: IuserManagementService
  ) {}

  async getAllPaginatedUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await this.userManagementService.getPaginatedUsers(page);
      
      res.status(HTTP_STATUS.OK).json({
        message: result.message,
        users: result.users || [],
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      });
    } catch (error) {
      console.error("Error fetching paginated users:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching paginated users.",
      });
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: "User ID is required",
        });
        return;
      }

      const result = await this.userManagementService.toggleUserStatus(id);
      
      if (result.message === "User not found") {
        res.status(HTTP_STATUS.NOT_FOUND).json(result);
        return;
      }

      if (result.message === "Failed to toggle user status") {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(result);
        return;
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error",
      });
    }
  }
}
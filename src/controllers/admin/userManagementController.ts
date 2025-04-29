import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IuserManagemenrController } from "../../interfaces/Icontrollers/IuserManagementController";
import { inject, injectable } from "tsyringe";
import { IuserManagementService } from "../../interfaces/Iservices/IadminService/IuserManagementService";

@injectable()
export class UserManagementController implements IuserManagemenrController {
  constructor(
    @inject("IuserManagementService")
    private userManagementService: IuserManagementService
  ) {}

  async getAllPaginatedUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const response = await this.userManagementService.getPaginatedUsers(page);
      
      res.status(HTTP_STATUS.OK).json({
        message: response.message,
        users: response.users || [],
        total: response.total || 0,
        totalPages: response.totalPages || 0,
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
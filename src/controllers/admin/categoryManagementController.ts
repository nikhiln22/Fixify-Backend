import { IcategoryManagementController } from "../../interfaces/Icontrollers/Iadmincontrollers/IcategoryManagementController";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { ICategoryManagementService } from "../../interfaces/Iservices/IadminService/IcategoryManagementService";
import { Request, Response } from "express";

@injectable()
export class CategoryManagementController
  implements IcategoryManagementController
{
  constructor(
    @inject("ICategoryManagementService")
    private categoryManagementService: ICategoryManagementService
  ) {}

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin adding the category");
      const name = req.body.name;

      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Image file is required",
        });
        return;
      }

      const result = await this.categoryManagementService.addCategory(
        name,
        req.file.path
      );

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log("error occured while adding the category:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occured while adding the category",
      });
    }
  }

  async getAllCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the applicants listing");

      const page = parseInt(req.query.page as string) || 1;

      const response = await this.categoryManagementService.getAllCategories(
        page
      );

      res.status(response.status).json({
        message: response.message,
        categories: response.categories || [],
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });
    } catch (error) {
      console.error("Error in getAllPaginatedApplicants controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching applicants data",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle catagory status");
      const categoryId = req.params.categoryId;

      const result = await this.categoryManagementService.toggleCategoryStatus(
        categoryId
      );

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while toggling category status:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while toggling category status",
      });
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the category from the controller");
      const categoryId = req.params.categoryId;

      if (!categoryId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      const { name } = req.body;

      const updateData: { name?: string; image?: string } = {};


      if (name !== undefined) {
        updateData.name = name;
      }

      if (req.file) {
        updateData.image = req.file.path;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const result = await this.categoryManagementService.updateCategory(
        categoryId,
        updateData
      );

      res.status(result.status || HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while editing category:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while editing category",
      });
    }
  }
}

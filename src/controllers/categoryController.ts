import { HTTP_STATUS } from "../constants/httpStatus";
import { inject, injectable } from "tsyringe";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { ICategoryService } from "../interfaces/Iservices/IcategoryService";
import { Request, Response } from "express";

@injectable()
export class CategoryController {
  constructor(
    @inject("ICategoryService") private _categoryService: ICategoryService
  ) {}

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin adding the category");
      const name = req.body.name;

      if (!req.file) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Image file is required"));
        return;
      }

      const serviceResponse = await this._categoryService.addCategory(
        name,
        req.file.path
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to add category"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the category:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse("An error occurred while adding the category")
        );
    }
  }

  async getAllCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function fetching all the categories");

      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;

      const serviceResponse = await this._categoryService.getAllCategories({
        page,
        limit,
        search,
        status,
      });

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch categories"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllCategory controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching categories data"));
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle category status");
      const categoryId = req.params.categoryId;

      const serviceResponse = await this._categoryService.toggleCategoryStatus(
        categoryId
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to toggle category status"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while toggling category status:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            "An error occurred while toggling category status"
          )
        );
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the category from the controller");
      const categoryId = req.params.categoryId;

      if (!categoryId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Category ID is required"));
        return;
      }

      const { name } = req.body;

      const updateData: { name?: string; image?: string } = {};

      if (name !== undefined) updateData.name = name;
      if (req.file) updateData.image = req.file.path;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._categoryService.updateCategory(
        categoryId,
        updateData
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to update category"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while editing category:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("An error occurred while editing category"));
    }
  }
}

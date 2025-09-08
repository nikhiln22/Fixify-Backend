import { inject, injectable } from "tsyringe";
import { ICategoryService } from "../interfaces/Iservices/IcategoryService";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import {
  AddCategoryResponse,
  ToggleCategoryStatusResponse,
  UpdatedCategoryResponse,
} from "../interfaces/DTO/IServices/IservicesService";
import { ICategory } from "../interfaces/Models/Icategory";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject("ICategoryRepository")
    private _categoryRepository: ICategoryRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async addCategory(
    name: string,
    imageFile: string
  ): Promise<AddCategoryResponse> {
    try {
      const existingCategory =
        await this._categoryRepository.findCategoryByName(name);
      if (existingCategory) {
        return {
          success: false,
          message: "Category already exists",
        };
      }

      const imageUrl = await this.fileUploader.uploadFile(imageFile, {
        folder: "fixify/categories",
      });

      console.log("imageUrl:", imageUrl);

      if (!imageUrl) {
        return {
          success: false,
          message: "Failed to upload image",
        };
      }

      const newCategory = await this._categoryRepository.addCategory(
        name,
        imageUrl
      );
      console.log("response from the category adding service:", newCategory);
      return {
        success: true,
        message: "Category addedd successfully",
        data: newCategory,
      };
    } catch (error) {
      console.log("error occured while adding the category", error);
      return {
        success: false,
        message: "something went wrong while adding the category",
      };
    }
  }

  async getAllCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      categories: ICategory[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("fetching all the categories from the service services");

      const page = options.page;
      const limit = options.limit;

      const result = await this._categoryRepository.getAllCategories({
        page,
        limit,
        search: options.search,
        status: options.status,
      });

      console.log("result from the categorymanagementservice:", result);

      return {
        success: true,
        message: "categories fetched successfully",
        data: {
          categories: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.log("error fetching the categories:", error);
      return {
        success: false,
        message: "failed to fetch the categories",
      };
    }
  }

  async toggleCategoryStatus(
    categoryId: string
  ): Promise<ToggleCategoryStatusResponse> {
    try {
      console.log("toggling the status of the category");
      const category = await this._categoryRepository.findCategoryById(
        categoryId
      );

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      const newStatus = category.status === "Active" ? "Blocked" : "Active";

      const updatedCategory =
        await this._categoryRepository.updateCategoryStatus(
          categoryId,
          newStatus
        );

      if (!updatedCategory) {
        return {
          success: false,
          message: "Failed to update category",
        };
      }

      console.log(
        "Response after toggling category status from the category repository:",
        updatedCategory
      );

      return {
        success: true,
        message: `${category.name} successfully ${
          newStatus === "Active" ? "UnBlocked" : "Blocked"
        }`,
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error toggling category status:", error);
      return {
        success: false,
        message: "Failed to toggle category status",
      };
    }
  }

  async updateCategory(
    categoryId: string,
    updateData: { name?: string; image?: string }
  ): Promise<UpdatedCategoryResponse> {
    try {
      console.log("Updating category details");

      const category = await this._categoryRepository.findCategoryById(
        categoryId
      );

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      const updatedFields: { name?: string; image?: string } = {};

      if (updateData.name !== undefined) {
        updatedFields.name = updateData.name;
      }

      if (updateData.image) {
        const newImageUrl = await this.fileUploader.uploadFile(
          updateData.image,
          { folder: "categories" }
        );

        if (!newImageUrl) {
          return {
            success: false,
            message: "Failed to upload image to cloud storage",
          };
        }

        updatedFields.image = newImageUrl;
      }

      if (Object.keys(updatedFields).length === 0) {
        return {
          success: false,
          message: "No update data provided",
        };
      }

      const updatedCategory = await this._categoryRepository.updateCategory(
        categoryId,
        updatedFields
      );

      if (!updatedCategory) {
        return {
          success: false,
          message: "Failed to update category",
        };
      }

      return {
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        message: "Failed to update category",
      };
    }
  }
}

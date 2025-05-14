import { ICategoryManagementService } from "../../interfaces/Iservices/IadminService/IcategoryManagementService";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { ICategoryRepository } from "../../interfaces/Irepositories/IcategoryRepository";
import {
  AddCategoryResponseDTO,
  getCategoriesResponse,
  ToggleCategoryStatusResponseDTO,
  UpdatedCategoryResponseDTO,
} from "../../interfaces/DTO/IServices/Iadminservices.dto/categoryManagement.dto";
import { IFileUploader } from "../../interfaces/IfileUploader/IfileUploader";

@injectable()
export class CategoryManagementService implements ICategoryManagementService {
  constructor(
    @inject("ICategoryRepository")
    private categoryRepository: ICategoryRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async addCategory(
    name: string,
    imageFile: string
  ): Promise<AddCategoryResponseDTO> {
    try {
      const existingCategory = await this.categoryRepository.findCategoryByName(
        name
      );
      if (existingCategory) {
        return {
          success: false,
          status: HTTP_STATUS.OK,
          message: "Category already exists",
        };
      }

      const imageUrl = await this.fileUploader.uploadFile(imageFile, {
        folder: "fixify/categories",
      });

      if (!imageUrl) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to upload image",
        };
      }

      const newCategory = await this.categoryRepository.addCategory(
        name,
        imageUrl
      );
      console.log("response from the category adding service:", newCategory);
      return {
        status: HTTP_STATUS.CREATED,
        success: true,
        message: "Category addedd successfully",
        data: newCategory,
      };
    } catch (error) {
      console.log("error occured while adding the category");
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        success: false,
        message: "something went wrong while adding the category",
      };
    }
  }

  async getAllCategories(page: number): Promise<getCategoriesResponse> {
    try {
      console.log(
        "fetching all the categories from the category management service"
      );
      let limit = 5;
      const result = await this.categoryRepository.getAllCategories(
        page,
        limit
      );
      console.log("result from the categorymanagementservice:", result);

      const totalPages = Math.ceil(result.total / limit);

      return {
        status: HTTP_STATUS.OK,
        message: "categories fetched successfully",
        categories: result.data,
        total: result.total,
        totalPages,
      };
    } catch (error) {
      console.log("error fetching the applicants:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "failed to fetch the applicants",
      };
    }
  }

  async toggleCategoryStatus(
    categoryId: string
  ): Promise<ToggleCategoryStatusResponseDTO> {
    try {
      console.log("toggling the status of the category");
      const category = await this.categoryRepository.findCategoryById(
        categoryId
      );

      if (!category) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Category not found",
        };
      }

      const newStatus = !category.status;

      const updatedCategory =
        await this.categoryRepository.updateCategoryStatus(
          categoryId,
          newStatus
        );

      if (!updatedCategory) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Failed to update category",
        };
      }

      console.log(
        "Response after toggling category status from the category repository:",
        updatedCategory
      );

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: `Category successfully ${
          newStatus ? "activated" : "deactivated"
        }`,
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error toggling category status:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to toggle category status",
      };
    }
  }

  async updateCategory(
    categoryId: string,
    updateData: { name?: string; image?: string }
  ): Promise<UpdatedCategoryResponseDTO> {
    try {
      console.log("Updating category details");

      const category = await this.categoryRepository.findCategoryById(
        categoryId
      );

      if (!category) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
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
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Failed to upload image to cloud storage",
          };
        }


        updatedFields.image = newImageUrl;
      }

      if (Object.keys(updatedFields).length === 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "No update data provided",
        };
      }

      const updatedCategory = await this.categoryRepository.updateCategory(
        categoryId,
        updatedFields
      );

      if (!updatedCategory) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update category",
        };
      }

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Category updated successfully",
        data: updatedCategory,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to update category",
      };
    }
  }
}

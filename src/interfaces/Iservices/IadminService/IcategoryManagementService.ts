import {
  AddCategoryResponseDTO,
  getCategoriesResponse,
  ToggleCategoryStatusResponseDTO,
  UpdatedCategoryResponseDTO,
} from "../../DTO/IServices/Iadminservices.dto/categoryManagement.dto";
import { Icategory } from "../../Models/Icategory";

export interface ICategoryManagementService {
  addCategory(name: string, imageFile: string): Promise<AddCategoryResponseDTO>;
  getAllCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      categories: Icategory[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;

  toggleCategoryStatus(
    categoryId: String
  ): Promise<ToggleCategoryStatusResponseDTO>;
  updateCategory(
    categoryId: string,
    updateData: { name?: string; image?: string }
  ): Promise<UpdatedCategoryResponseDTO>;
}

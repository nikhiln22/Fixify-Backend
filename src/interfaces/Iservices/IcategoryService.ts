import {
  AddCategoryResponse,
  ToggleCategoryStatusResponse,
  UpdatedCategoryResponse,
} from "../DTO/IServices/IservicesService";
import { ICategory } from "../Models/Icategory";

export interface ICategoryService {
  addCategory(name: string, imageFile: string): Promise<AddCategoryResponse>;
  getAllCategories(options: {
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
  }>;
  toggleCategoryStatus(
    categoryId: string
  ): Promise<ToggleCategoryStatusResponse>;
  updateCategory(
    categoryId: string,
    updateData: { name?: string; image?: string }
  ): Promise<UpdatedCategoryResponse>;
}

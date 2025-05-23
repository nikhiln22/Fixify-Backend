import {
  AddCategoryResponseDTO,
  AddServiceResponse,
  ServiceData,
  ToggleCategoryStatusResponseDTO,
  UpdatedCategoryResponseDTO,
} from "../DTO/IServices/IservicesService";
import { IService } from "../Models/Iservice";
import { Icategory } from "../Models/Icategory";

export interface IServiceService {
  addService(data: ServiceData): Promise<AddServiceResponse>;
  getAllServices(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      services: IService[];
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

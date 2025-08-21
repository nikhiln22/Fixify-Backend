import {
  AddCategoryResponse,
  AddServiceResponse,
  GetServiceDetailsResponse,
  ServiceData,
  ToggleCategoryStatusResponse,
  ToggleServiceStatusResponse,
  UpdatedCategoryResponse,
  UpdatedServiceResponse,
} from "../DTO/IServices/IservicesService";
import { IService } from "../../interfaces/Models/Iservice";
import { ICategory } from "../../interfaces/Models/Icategory";

export interface IServiceService {
  addService(data: ServiceData): Promise<AddServiceResponse>;
  getAllServices(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }): Promise<{
    success: boolean;
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
  toggleServiceStatus(categoryId: string): Promise<ToggleServiceStatusResponse>;
  updateService(
    serviceId: string,
    updateData: {
      name?: string;
      image?: string;
      description?: string;
      price?: number;
      categoryId?: string;
    }
  ): Promise<UpdatedServiceResponse>;
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
  getServiceDetails(serviceId: string): Promise<GetServiceDetailsResponse>;
}

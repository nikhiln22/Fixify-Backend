import {
  AddCategoryResponse,
  AddServiceResponse,
  getServiceDetailsResponse,
  ServiceData,
  ToggleCategoryStatusResponse,
  ToggleServiceStatusResponse,
  UpdatedCategoryResponse,
  UpdatedServiceResponse,
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
    status?: string;
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
  toggleServiceStatus(
    categoryId: String
  ): Promise<ToggleServiceStatusResponse>;
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
  ): Promise<ToggleCategoryStatusResponse>;
  updateCategory(
    categoryId: string,
    updateData: { name?: string; image?: string }
  ): Promise<UpdatedCategoryResponse>;
  getServiceDetails(serviceId:string):Promise<getServiceDetailsResponse>
}

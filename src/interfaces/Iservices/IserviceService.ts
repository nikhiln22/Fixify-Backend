import {
  AddServiceResponse,
  GetServiceDetailsResponse,
  ServiceData,
  ToggleServiceStatusResponse,
  UpdatedServiceResponse,
} from "../DTO/IServices/IservicesService";
import { IService } from "../../interfaces/Models/Iservice";

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
  getServiceDetails(serviceId: string): Promise<GetServiceDetailsResponse>;
}

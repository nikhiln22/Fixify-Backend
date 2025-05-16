import {
  AddServiceResponseDTO,
  ServiceData,
} from "../../DTO/IServices/Iadminservices.dto/serviceManagement.dto";
import { IService } from "../../Models/Iservice";

export interface IserviceManagementService {
  addService(data: ServiceData): Promise<AddServiceResponseDTO>;
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
}

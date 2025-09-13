import {
  DesignationResponse,
  ToggleDesignationResponse,
} from "../DTO/IServices/IdesignationService";
import { IDesignation } from "../Models/Idesignation";

export interface IDesignationService {
  addDesignation(designation: string): Promise<DesignationResponse>;
  getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      designations: IDesignation[];
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
  toggleDesignationStatus(id: string): Promise<ToggleDesignationResponse>;
}

import { DesignationResponseDTO } from "../../DTO/IServices/Iadminservices.dto/jobDesignationService.dto";
import { IjobDesignation } from "../../Models/IjobDesignation";

export interface IjobDesignationService {
  addDesignation(designation: string): Promise<DesignationResponseDTO>;
  getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      designations: IjobDesignation[];
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
  toggleDesignationStatus(id: string): Promise<DesignationResponseDTO>;
  findDesignationByName(name: string): Promise<DesignationResponseDTO>;
}

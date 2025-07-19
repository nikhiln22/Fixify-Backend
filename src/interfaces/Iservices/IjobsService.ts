import { DesignationResponse } from "../DTO/IServices/IjobService";
import { IJobDesignation } from "../Models/IjobDesignation";

export interface IJobsService {
  addDesignation(designation: string): Promise<DesignationResponse>;
  getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?:string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      designations: IJobDesignation[];
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
  toggleDesignationStatus(id: string): Promise<DesignationResponse>;
  findDesignationByName(name: string): Promise<DesignationResponse>;
}

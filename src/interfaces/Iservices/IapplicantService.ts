import {
  PaginatedTechnicianDto,
  RejectTechnicianResponse,
  TechnicianProfileResponse,
} from "../DTO/IServices/ItechnicianService";

export interface IApplicantService {
  getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      applicants: PaginatedTechnicianDto[];
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
  getApplicantDetails(technicianId: string): Promise<TechnicianProfileResponse>;
  verifyTechnician(
    technicianId: string
  ): Promise<{ success: boolean; message: string }>;
  rejectTechnician(
    technicianId: string,
    reason?: string
  ): Promise<RejectTechnicianResponse>;
}

import {
  CreateTechnician,
  FindByEmailResponse,
  FindByIdResponse,
  RejectTechnicianResponse,
  TechnicianQualification,
  UpdatePasswordResponse,
  UpdateTechnicianQualificationResponse,
  VerifyTechnicianResponse,
} from "../DTO/IRepository/ItechnicianRepository";
import { ITechnician } from "../Models/Itechnician";

export interface ITechnicianRepository {
  createTechnician(technicianData: CreateTechnician): Promise<ITechnician>;
  findByEmail(email: string): Promise<FindByEmailResponse>;
  getTechnicianById(id: string): Promise<FindByIdResponse>;
  updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponse>;
  updateTechnicianQualification(
    technicianId: string,
    qualificationData: TechnicianQualification
  ): Promise<UpdateTechnicianQualificationResponse>;
  getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  verifyTechnician(technicianId: string): Promise<VerifyTechnicianResponse>;
  rejectTechnician(technicianId: string): Promise<RejectTechnicianResponse>;
  getAllTechnicians(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    designation?: string;
  }): Promise<{
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  toggleTechnicianStatus(
    technicianId: string,
    newStatus: "Active" | "Blocked"
  ): Promise<{
    success: boolean;
    message?: string;
    technicianData?: ITechnician;
  }>;
  nearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number
  ): Promise<ITechnician[]>;

  getTechniciansWithSubscriptions(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterPlan?: string;
  }): Promise<{
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
}

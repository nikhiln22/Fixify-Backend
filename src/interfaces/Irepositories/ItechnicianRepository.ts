import {
  createTechnician,
  findByEmailResponse,
  findByIdResponse,
  RejectTechnicianResponse,
  TechnicianQualification,
  UpdatePasswordResponse,
  UpdateTechnicianQualificationResponse,
  VerifyTechnicianResponse,
} from "../DTO/IRepository/ItechnicianRepository";
import { Itechnician } from "../Models/Itechnician";

export interface ItechnicianRepository {
  createTechnician(technicianData: createTechnician): Promise<Itechnician>;
  findByEmail(email: string): Promise<findByEmailResponse>;
  getTechnicianById(id: string): Promise<findByIdResponse>;
  updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponse>;
  updateTechnicianQualification(
    technicianId: string,
    qualificationData: TechnicianQualification
  ): Promise<UpdateTechnicianQualificationResponse>;
  getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    data: Itechnician[];
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
    data: Itechnician[];
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
    technicianData?: Itechnician;
  }>;
  nearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number
  ): Promise<Itechnician[]>;
}

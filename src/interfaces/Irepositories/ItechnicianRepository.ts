import {
  CreateTechnician,
  INearbyTechnicianResponse,
  RejectTechnicianResponse,
  TechnicianQualification,
  UpdateTechnicianQualificationResponse,
  VerifyTechnicianResponse,
} from "../DTO/IRepository/ItechnicianRepository";
import { ITechnician } from "../Models/Itechnician";

export interface ITechnicianRepository {
  createTechnician(technicianData: CreateTechnician): Promise<ITechnician>;
  findByEmail(email: string): Promise<ITechnician | null>;
  updateTechnicianExpiry(email: string, newExpiresAt: Date): Promise<void>;
  updateTechnicianEmailVerification(email: string): Promise<void>;
  getTechnicianById(id: string): Promise<ITechnician | null>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
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
  ): Promise<ITechnician>;
  nearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number
  ): Promise<INearbyTechnicianResponse[]>;
  countActiveTechnicians(): Promise<number>;
}

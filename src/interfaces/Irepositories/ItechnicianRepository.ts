import {
  createTechnician,
  findByEmailResponse,
  findByIdResponse,
  TechnicianQualification,
  UpdatePasswordResponse,
  UpdateTechnicianQualificationResponse,
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
  getUnverifiedTechnicians(
    page: number,
    limit: number
  ): Promise<{
    data: Itechnician[];
    total: number;
  }>;
}

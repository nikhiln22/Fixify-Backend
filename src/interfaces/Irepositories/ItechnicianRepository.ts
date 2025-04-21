import {
  createTechnicianDTO,
  findByEmailResponseDTO,
  TechnicianQualificationDTO,
  UpdatePasswordResponseDTO,
  UpdateTechnicianQualificationResponseDTO,
} from "../DTO/IRepository/technicianRepositoryDTO";
import { Itechnician } from "../Models/Itechnician";

export interface ItechnicianRepository {
  createTechnician(technicianData: createTechnicianDTO): Promise<Itechnician>;
  findByEmail(email: string): Promise<findByEmailResponseDTO>;
  updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponseDTO>;
  updateTechnicianQualification(
    technicianId: string,
    qualificationData: TechnicianQualificationDTO
  ): Promise<UpdateTechnicianQualificationResponseDTO>;
}

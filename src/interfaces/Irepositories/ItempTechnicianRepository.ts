import {
  createTempTechnicianResponseDTO,
  findTempTechnicianByEmailDTO,
  findTempTechnicianByIdDTO,
} from "../DTO/IRepository/ItechnicianRepository";
import { ItempTechnician } from "../Models/ItempTechnician";

export interface ItempTechnicianRepository {
  createTempTechnician(technicianData: ItempTechnician ): Promise<createTempTechnicianResponseDTO>;
  findTempTechnicianById(tempTechnicianId: String): Promise<findTempTechnicianByIdDTO>;
  findTempTechnicianByEmail(email: string): Promise<findTempTechnicianByEmailDTO>;
}
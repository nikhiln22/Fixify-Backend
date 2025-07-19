import {
  CreateTempTechnicianResponse,
  FindTempTechnicianByEmail,
  FindTempTechnicianById,
} from "../DTO/IRepository/ItechnicianRepository";
import { ITempTechnician } from "../Models/ItempTechnician";

export interface ITempTechnicianRepository {
  createTempTechnician(
    technicianData: ITempTechnician
  ): Promise<CreateTempTechnicianResponse>;
  findTempTechnicianById(
    tempTechnicianId: string
  ): Promise<FindTempTechnicianById>;
  findTempTechnicianByEmail(email: string): Promise<FindTempTechnicianByEmail>;
}

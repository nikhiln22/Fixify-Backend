import { AddDesignationResponseDTO } from "../DTO/IServices/jobDesignationService.dto";
import { IjobDesignation } from "../Models/IjobDesignation";


export interface IjobDesignationService {
  addDesignation(designation: string): Promise<AddDesignationResponseDTO>;
  getAllDesignations(): Promise<AddDesignationResponseDTO>
  getPaginatedDesignations(page: number): Promise<{ status: number, message: string, data?: IjobDesignation[], total?: number }>;
  toggleDesignationStatus(id: string): Promise<AddDesignationResponseDTO>;
  findDesignationByName(name: string): Promise<AddDesignationResponseDTO>
}

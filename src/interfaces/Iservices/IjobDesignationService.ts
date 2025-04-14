import { AddDesignationResponseDTO } from "../DTO/IServices/jobDesignationService.dto";


export interface IjobDesignationService {
  addDesignation(designation: string): Promise<AddDesignationResponseDTO>;
  getAllDesignations(): Promise<AddDesignationResponseDTO>
  blockDesignation(id: string): Promise<AddDesignationResponseDTO>;
  findDesignationByName(name: string): Promise<AddDesignationResponseDTO>
}

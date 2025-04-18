import { Itechnician } from "../../Models/Itechnician";
import { ItempTechnician } from "../../Models/ItempTechnician";

export interface findByEmailResponseDTO {
  success: boolean;
  technicianData?: Itechnician;
}

export interface createTempTechnicianResponseDTO {
  success: boolean;
  tempTechnicianId: String;
}

export interface findTempTechnicianByIdDTO {
  success: boolean;
  tempTechnicianData?: ItempTechnician;
  message?: string;
}

export interface createTechnicianDTO {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export interface findTempTechnicianByEmailDTO {
  success: boolean;
  tempTechnicianData?: ItempTechnician;
  message?: string;
}


export interface UpdatePasswordResponseDTO {
  success: boolean;
  message?: string;
}

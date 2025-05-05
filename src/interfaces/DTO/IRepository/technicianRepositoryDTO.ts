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

export interface TechnicianQualificationDTO {
  experience: string;
  designation: string;
  about: string;
  profilePhoto?: string;
  certificates?: string[];
}

export interface UpdateTechnicianQualificationResponseDTO {
  success: boolean;
  message: string;
  technician?: Pick<
  Itechnician,
  "yearsOfExperience" | "Designation" | "About" | "image" | "certificates"
>;
}

export interface findByIdResponseDTO {
  success: boolean;
  technicianData?: Itechnician | null;
  message?: string;
}

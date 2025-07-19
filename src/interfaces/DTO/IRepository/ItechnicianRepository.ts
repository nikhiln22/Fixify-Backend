import { ITechnician } from "../../Models/Itechnician";
import { ITempTechnician } from "../../Models/ItempTechnician";

export interface FindByEmailResponse {
  success: boolean;
  technicianData?: ITechnician;
}

export interface CreateTempTechnicianResponse {
  success: boolean;
  tempTechnicianId: string;
}

export interface FindTempTechnicianById {
  success: boolean;
  tempTechnicianData?: ITempTechnician;
  message?: string;
}

export interface CreateTechnician {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export interface FindTempTechnicianByEmail {
  success: boolean;
  tempTechnicianData?: ITempTechnician;
  message?: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export interface TechnicianQualification {
  experience: string;
  designation: string;
  about: string;
  latitude: number;
  longitude: number;
  address: string;
  profilePhoto?: string;
  certificates?: string[];
}

export interface UpdateTechnicianQualificationResponse {
  success: boolean;
  message: string;
  technician?: Pick<
    ITechnician,
    | "yearsOfExperience"
    | "Designation"
    | "About"
    | "image"
    | "certificates"
    | "address"
  >;
}

export interface FindByIdResponse {
  success: boolean;
  technicianData?: ITechnician | null;
  message?: string;
}

export interface VerifyTechnicianResponse {
  success: boolean;
  message: string;
  technicianData?: ITechnician;
}

export interface RejectTechnicianResponse {
  success: boolean;
  message: string;
}

import { Itechnician } from "../../Models/Itechnician";
import { ItempTechnician } from "../../Models/ItempTechnician";

export interface findByEmailResponse {
  success: boolean;
  technicianData?: Itechnician;
}

export interface createTempTechnicianResponse {
  success: boolean;
  tempTechnicianId: String;
}

export interface findTempTechnicianById {
  success: boolean;
  tempTechnicianData?: ItempTechnician;
  message?: string;
}

export interface createTechnician {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export interface findTempTechnicianByEmail {
  success: boolean;
  tempTechnicianData?: ItempTechnician;
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
    Itechnician,
    | "yearsOfExperience"
    | "Designation"
    | "About"
    | "image"
    | "certificates"
    | "address"
  >;
}

export interface findByIdResponse {
  success: boolean;
  technicianData?: Itechnician | null;
  message?: string;
}

export interface VerifyTechnicianResponse {
  success: boolean;
  message: string;
  technicianData?: Itechnician;
}

export interface RejectTechnicianResponse {
  success: boolean;
  message: string;
}

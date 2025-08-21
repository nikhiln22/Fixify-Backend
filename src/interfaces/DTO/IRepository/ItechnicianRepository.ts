import { ITechnician } from "../../Models/Itechnician";

export interface FindByEmailResponse {
  success: boolean;
  technicianData?: ITechnician;
}

export interface CreateTempTechnicianResponse {
  success: boolean;
  tempTechnicianId: string;
  email: string;
}

export interface CreateTechnician {
  username: string;
  email: string;
  phone: number;
  password: string;
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
  status: string;
  is_verified: boolean;
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

export interface INearbyTechnicianResponse {
  _id: string;
  username: string;
  image: string;
  yearsOfExperience: number;
  averageRating: number;
}

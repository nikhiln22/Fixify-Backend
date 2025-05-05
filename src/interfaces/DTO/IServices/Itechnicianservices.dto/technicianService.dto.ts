import { Itechnician } from "../../../Models/Itechnician";

export interface getJobDesignationsResponse {
  designation?: string[];
  message: string;
  success: Boolean;
  status: number;
}

export interface TechicianQualification {
  experience: string;
  designation: string;
  about: string;
  profilePhoto: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

export interface TechnicianQualificationUpdateResponse {
  success: boolean;
  status: number;
  message: string;
  technician?: Pick<
    Itechnician,
    "yearsOfExperience" | "Designation" | "About" | "image" | "certificates"
  >;
}

export interface TechnicianProfileResponse {
  message: string;
  success: boolean;
  status: number;
  technician?: {
    username?: string;
    email?: string;
    phone?: number;
    is_verified?: boolean;
    yearsOfExperience?: number;
    Designation?: string;
    About?: string;
    image?: string;
    certificates?: string[];
  };
}

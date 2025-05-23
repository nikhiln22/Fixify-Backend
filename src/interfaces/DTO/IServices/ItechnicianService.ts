import { Itechnician } from "../../../interfaces/Models/Itechnician";

export interface RegisterResponse {
  success: boolean;
  userData?: Itechnician;
  message: string;
  status: number;
}

export interface SignupTechnicianData {
  username: string;
  email: string;
  password: string;
  phone: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface tempTechnicianResponse {
  tempTechnicianId?: string;
  email?: string;
  success: boolean;
  status: number;
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  tempTechnicianId?: string;
  email?: string;
  status: number;
}

export interface verifyOtpData {
  tempTechnicianId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface loginResponse {
  success: boolean;
  status: number;
  message: string;
  role?: string;
  access_token?: string;
  refresh_token?: string;
  technician?: Itechnician;
}

export interface loginData {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
  status: number;
}

export interface ResetPasswordData {
  email: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  status: number;
}

export interface TechnicianQualification {
  experience: string;
  designation: string;
  about: string;
  city: string;
  preferredWorkLocation: string;
  profilePhoto: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

export interface TechnicianQualificationUpdateResponse {
  success: boolean;
  status: number;
  message: string;
  technician?: Pick<
    Itechnician,
    | "yearsOfExperience"
    | "Designation"
    | "About"
    | "image"
    | "certificates"
    | "city"
    | "preferredWorkLocation"
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
    city?: string;
    preferredWorkLocation?: string;
    About?: string;
    image?: string;
    certificates?: string[];
  };
}

import { ITechnician } from "../../../interfaces/Models/Itechnician";
import { ITimeSlot } from "../../Models/ItimeSlot";

export interface SignupTechnicianData {
  username: string;
  email: string;
  password: string;
  phone: number;
}

export interface signupResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  data?: Pick<
    ITechnician,
    | "_id"
    | "username"
    | "email"
    | "phone"
    | "image"
    | "is_verified"
    | "status"
    | "email_verified"
  >;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface ResetPasswordData {
  email: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpData {
  otp: string;
  email: string;
  purpose?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface ApproveTechnicianResponse {
  success: boolean;
  message: string;
  technician?: ITechnician;
}

export interface RejectTechnicianResponse {
  success: boolean;
  message: string;
  reason?: string;
}

export interface PendingTechniciansResponse {
  success: boolean;
  message: string;
  technicians?: ITechnician[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface TechnicianQualification {
  experience: string;
  designation: string;
  about: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  is_verified: boolean;
  profilePhoto?: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

export interface TechnicianQualificationUpdateResponse {
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
    | "email_verified"
    | "is_verified"
  >;
  adminId?: string;
}

export interface TechnicianProfileResponse {
  message: string;
  success: boolean;
  technician?: {
    username?: string;
    email?: string;
    phone?: number;
    is_verified?: boolean;
    email_verified?: boolean;
    status?: string;
    yearsOfExperience?: number;
    Designation?: {
      designation: string;
    };
    address?: string;
    About?: string;
    image?: string;
    certificates?: string[];
  };
}

export interface ToggleTechnicianStatusResponse {
  message: string;
  success: boolean;
  data?: {
    technicianId: string;
    status?: string;
  };
}

export interface AddTimeSlotsResult {
  success: boolean;
  message: string;
  data?: ITimeSlot[];
}

export interface TechnicianQualificationSaveData {
  experience: string;
  designation: string;
  about: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  is_verified: boolean;
  profilePhoto?: string;
  certificates?: string[];
}

export interface TechnicianProfileUpdateData {
  username?: string;
  phone?: string;
  yearsOfExperience?: string;
  image?: string;
  certificates?: string;
  About?: string;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  technician?: ITechnician;
}

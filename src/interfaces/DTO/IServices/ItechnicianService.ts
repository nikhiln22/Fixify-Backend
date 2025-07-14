import { Itechnician } from "../../../interfaces/Models/Itechnician";
import { ITimeSlot } from "../../Models/ItimeSlot";

export interface RegisterResponse {
  success: boolean;
  userData?: Itechnician;
  message: string;
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
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  tempTechnicianId?: string;
  email?: string;
}

export interface verifyOtpData {
  tempTechnicianId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface loginResponse {
  success: boolean;
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
}

export interface ResetPasswordData {
  email: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface TechnicianQualification {
  experience: string;
  designation: string;
  about: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  profilePhoto: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

export interface TechnicianQualificationUpdateResponse {
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

export interface TechnicianProfileResponse {
  message: string;
  success: boolean;
  technician?: {
    username?: string;
    email?: string;
    phone?: number;
    is_verified?: boolean;
    yearsOfExperience?: number;
    Designation?: string;
    address?: string;
    About?: string;
    image?: string;
    certificates?: string[];
  };
}

export interface VerifyTechnicianServiceResponse {
  success: boolean;
  message: string;
}

export interface RejectTechnicianServiceResponse {
  success: boolean;
  message: string;
}

export interface ToggleTechnicianStatusResponse {
  message: string;
  success: boolean;
  technician?: Itechnician;
}

export interface AddTimeSlotsResult {
  success: boolean;
  message: string;
  data?: ITimeSlot[];
}

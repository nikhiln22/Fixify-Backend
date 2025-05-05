import { Itechnician } from "../../../Models/Itechnician";

export interface RegisterResponseDTO {
  success: boolean;
  userData?: Itechnician;
  message: string;
  status: number;
}

export interface SignupTechnicianDataDTO {
  username: string;
  email: string;
  password: string;
  phone: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface tempTechnicianResponseDTO {
  tempTechnicianId?: string;
  email?: string;
  success: boolean;
  status: number;
  message?: string;
}

export interface ResendOtpResponseDTO {
  success: boolean;
  message: string;
  tempTechnicianId?: string;
  email?: string;
  status: number;
}

export interface verifyOtpDataDTO {
  tempTechnicianId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface loginResponseDTO {
  success: boolean;
  status: number;
  message: string;
  role?: string;
  access_token?: string;
  refresh_token?: string;
  technician?: Pick<
    Itechnician,
    "username" | "phone" | "email" | "is_verified"
  >;
}

export interface loginDataDTO {
  email: string;
  password: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ForgotPasswordResponseDTO {
  success: boolean;
  message: string;
  email?: string;
  status: number;
}

export interface ResetPasswordDataDTO {
  email: string;
  password: string;
}

export interface ResetPasswordResponseDTO {
  success: boolean;
  message: string;
  status: number;
}

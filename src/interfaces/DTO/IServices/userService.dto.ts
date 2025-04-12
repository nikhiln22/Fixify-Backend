import { Iuser } from "../../Models/Iuser";

export interface RegisterResponseDTO {
  success: boolean;
  userData?: Iuser;
  message: string;
  status: number;
}

export interface SignupUserDataDTO {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface tempUserResponseDTO {
  tempUserId?: string;
  email?: string;
  success: boolean;
  status: number;
  message?: string;
}

export interface ResendOtpResponseDTO {
  success: boolean;
  message: string;
  tempUserId?: string;
  email?: string;
  status: number;
}

export interface verifyOtpDataDTO {
  tempUserId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface loginResponseDTO {
  success: boolean;
  status: number;
  message: string;
  role?: string;
  userId?: string;
  access_token?: string;
  refresh_token?: string;
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

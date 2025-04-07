import { Iuser } from "../../Models/Iuser";

export interface RegisterResponseDTO {
  success: boolean;
  userData?: Iuser;
  message: string;
  access_token?: string;
  refresh_token?: string;
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
  tempUserId: string;
  otp: string;
}

export interface loginResposnseDTO {
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

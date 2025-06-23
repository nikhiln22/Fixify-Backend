import { IBooking } from "../../Models/Ibooking";
import { Iuser } from "../../Models/Iuser";

export interface RegisterResponse {
  success: boolean;
  userData?: Iuser;
  message: string;
  status: number;
}

export interface SignupUserData {
  username: string;
  email: string;
  password: string;
  phone: number;
  status: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface tempUserResponse {
  tempUserId?: string;
  email?: string;
  success: boolean;
  status: number;
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  tempUserId?: string;
  email?: string;
  status: number;
}

export interface verifyOtpData {
  tempUserId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface loginResponse {
  success: boolean;
  status: number;
  message: string;
  role?: string;
  user?: Pick<Iuser, "username" | "email" | "phone" | "image">;
  access_token?: string;
  refresh_token?: string;
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

export interface ToggleUserStatusResponse {
  message: string;
  user?: Iuser;
}

export interface UserProfileResponse {
  message: string;
  success: boolean;
  status: number;
  user?: Iuser;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  status: number;
  user?: Iuser;
}

export interface UserProfileUpdateData {
  username?: string;
  phone?: string;
  image?: string;
}

export interface CreateBookingRequest {
  technicianId: string;
  serviceId: string;
  addressId: string;
  timeSlotId: string;
  bookingAmount: number;
  paymentMethod: "Online" | "Wallet";
  bookingStatus?: "Pending" | "Booked" | "Cancelled" | "Completed";
}

export interface BookServiceResponse {
  success: boolean;
  status: number;
  message: string;
  data?: IBooking | null;
}

export interface AddMoneyResponse {
  success: boolean;
  status: number;
  message: string;
  data?: {
    checkoutUrl: string;
    sessionId: string;
    requiresPayment: boolean;
  };
}

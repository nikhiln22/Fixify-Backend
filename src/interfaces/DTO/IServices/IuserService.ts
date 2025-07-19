import { IBooking } from "../../Models/Ibooking";
import { IUser } from "../../Models/Iuser";

export interface RegisterResponse {
  success: boolean;
  userData?: IUser;
  message: string;
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

export interface TempUserResponse {
  tempUserId?: string;
  email?: string;
  success: boolean;
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  tempUserId?: string;
  email?: string;
}

export interface VerifyOtpData {
  tempUserId?: string;
  otp: string;
  email?: string;
  purpose?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  role?: string;
  user?: Pick<IUser, "username" | "email" | "phone" | "image">;
  access_token?: string;
  refresh_token?: string;
}

export interface LoginData {
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

export interface ToggleUserStatusResponse {
  success: boolean;
  message: string;
  user?: IUser;
}

export interface UserProfileResponse {
  message: string;
  success: boolean;
  user?: IUser;
}

export interface EditProfileResponse {
  success: boolean;
  message: string;
  user?: IUser;
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
  message: string;
  data?: IBooking | null;
}

export interface AddMoneyResponse {
  success: boolean;
  message: string;
  data?: {
    checkoutUrl: string;
    sessionId: string;
    requiresPayment: boolean;
  };
}

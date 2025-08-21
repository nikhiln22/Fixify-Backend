import { IBooking } from "../../Models/Ibooking";
import { IUser } from "../../Models/Iuser";

export interface SignupUserData {
  username: string;
  email: string;
  password: string;
  phone: number;
}

export interface SignUpUserResponse {
  email?: string;
  success: boolean;
  message?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface VerifyOtpData {
  otp: string;
  email: string;
  purpose?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: Pick<
    IUser,
    "_id" | "username" | "email" | "phone" | "image" | "status"
  >;
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
  data?: {
    userId: string;
    status: string;
  };
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
  originalAmount?: number;
  bookingAmount: number;
  offerId?: string;
  couponId?: string;
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

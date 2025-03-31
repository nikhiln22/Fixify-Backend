import { Iuser } from "../../Models/Iuser";

export interface RegisterResponseDTO {
    success: boolean;
    data?: Iuser;
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
    message?: string
}

export interface verifyOtpDataDTO {
    tempUserId: string;
    otp: string;
}
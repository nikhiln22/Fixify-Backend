import { INearbyTechnicianResponse } from "../DTO/IRepository/ItechnicianRepository";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  ToggleTechnicianStatusResponse,
  VerifyOtpData,
  TechnicianQualificationUpdateResponse,
  signupTechnicianResponse,
  PaginatedTechnicianDto,
} from "../DTO/IServices/ItechnicianService";
import { VerifyOtpResponse } from "../DTO/IServices/IuserService";
import { IRating } from "../Models/Irating";

export interface ITechnicianService {
  technicianSignUp(
    data: SignupTechnicianData
  ): Promise<signupTechnicianResponse>;
  verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: LoginData): Promise<LoginResponse>;
  submitTechnicianQualifications(
    technicianId: string,
    qualificationData: {
      experience: string;
      designation: string;
      about: string;
      address: string;
      latitude: number | undefined;
      longitude: number | undefined;
      profilePhoto?: Express.Multer.File;
      certificates?: Express.Multer.File[];
    }
  ): Promise<TechnicianQualificationUpdateResponse>;
  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;
  getAllTechnicians(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    designation?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      technicians: PaginatedTechnicianDto[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;
  getNearbyTechnicians(
    designationId: string,
    longitude: number,
    latitude: number,
    radius: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: INearbyTechnicianResponse[];
  }>;

  toggleTechnicianStatus(
    technicianId: string
  ): Promise<ToggleTechnicianStatusResponse>;

  getTechnicianDetails(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;

  getReviews(techncianId: string): Promise<{
    success: boolean;
    message: string;
    reviews?: IRating[];
    averageRating?: number;
    totalReviews?: number;
  }>;
  countActiveTechnicians(): Promise<number>;
  getDashboardStats(technicianId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      totalEarnings: number;
      completedJobs: number;
      averageRating: number;
      pendingJobs: number;
    };
  }>;
  getTechnicianEarningsData(
    technicianId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      date: string;
      earnings: number;
      jobs: number;
      avgPerJob: number;
      period: string;
    }>;
    summary?: {
      totalEarnings: number;
      totalJobs: number;
      avgEarningsPerPeriod: number;
      period: string;
    };
  }>;
  getTechnicianServiceCategoriesData(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      jobsCount: number;
      percentage: number;
    }>;
    totalRevenue?: number;
  }>;
  getTechnicianBookingStatusData(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    totalBookings?: number;
  }>;
}

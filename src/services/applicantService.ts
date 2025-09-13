import { inject, injectable } from "tsyringe";
import { IApplicantService } from "../interfaces/Iservices/IapplicantService";
import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import {
  ApproveTechnicianResponse,
  RejectTechnicianResponse,
  TechnicianProfileResponse,
} from "../interfaces/DTO/IServices/ItechnicianService";
import { IEmailService } from "../interfaces/Iemail/Iemail";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { ITechnician } from "../interfaces/Models/Itechnician";
import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { IAddress } from "../interfaces/Models/Iaddress";

@injectable()
export class ApplicantService implements IApplicantService {
  constructor(
    @inject("ITechnicianRepository")
    private _technicianRepository: ITechnicianRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository,
    @inject("ISubscriptionPlanRepository")
    private _subsciptionPlanRepository: ISubscriptionPlanRepository,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IAddressService") private _addressService: IAddressService
  ) {}

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      applicants: ITechnician[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all the applcants");
      const page = options.page;
      const limit = options.limit;
      const result = await this._technicianRepository.getAllApplicants({
        page,
        limit,
      });

      console.log("result from the technician service:", result);

      return {
        success: true,
        message: "technicians fetched successfully",
        data: {
          applicants: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching applicants:", error);
      return {
        success: false,
        message: "Something went wrong while fetching applicants",
      };
    }
  }

  async getApplicantDetails(
    applicantId: string
  ): Promise<TechnicianProfileResponse> {
    try {
      console.log("Fetching applicant details with applicant ID:", applicantId);

      const result = await this._technicianRepository.getTechnicianById(
        applicantId
      );

      console.log(
        "result in the get technician by ID function in the technician service:",
        result
      );

      if (!result) {
        return {
          message: "Technician not found",
          success: false,
        };
      }

      let addresses: IAddress[] = [];
      try {
        console.log("Fetching addresses for applicant:", applicantId);
        const addressResponse = await this._addressService.getOwnerAddresses(
          applicantId,
          "technician"
        );

        if (addressResponse.success && addressResponse.data) {
          addresses = addressResponse.data;
          console.log("Successfully fetched addresses:", addresses.length);
        } else {
          console.log(
            "No addresses found for applicant:",
            addressResponse.message
          );
        }
      } catch (addressError) {
        console.error("Error fetching applicant addresses:", addressError);
      }

      return {
        message: "Technician profile fetched successfully",
        success: true,
        technician: {
          username: result.username,
          email: result.email,
          phone: result.phone,
          is_verified: result.is_verified,
          yearsOfExperience: result.yearsOfExperience,
          Designation: result.Designation
            ? {
                designation: (
                  result.Designation as unknown as { designation: string }
                ).designation,
              }
            : undefined,
          About: result.About,
          image: result.image,
          certificates: result.certificates,
          addresses: addresses,
        },
      };
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      return {
        message: "Failed to fetch technician profile",
        success: false,
      };
    }
  }

  async verifyTechnician(
    technicianId: string
  ): Promise<ApproveTechnicianResponse> {
    try {
      console.log("Verifying technician in service layer:", technicianId);

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
      if (!technician) {
        return { success: false, message: "Technician not found" };
      }

      const subscriptionPlan =
        await this._subsciptionPlanRepository.findByPlanName("Basic");
      if (!subscriptionPlan) {
        return { success: false, message: "Basic subscription plan not found" };
      }

      const subscriptionHistoryData = {
        technicianId: technician._id.toString(),
        subscriptionPlanId: subscriptionPlan._id.toString(),
        amount: 0,
        status: "Active" as const,
      };

      const [subscriptionHistory, newWallet] = await Promise.all([
        this._subscriptionPlanHistoryRepository.createHistory(
          subscriptionHistoryData
        ),
        this._walletRepository.createWallet(
          technician._id.toString(),
          "technician"
        ),
      ]);

      if (!subscriptionHistory || !newWallet) {
        return {
          success: false,
          message: "Failed to setup technician resources. Please try again.",
        };
      }

      const verificationResult =
        await this._technicianRepository.verifyTechnician(technicianId);
      if (!verificationResult.success) {
        return { success: false, message: verificationResult.message };
      }

      let emailSent = false;
      try {
        await this._emailService.sendTechnicianApprovalEmail(
          technician.email,
          technician.username
        );
        emailSent = true;
        console.log("Verification success email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending verification email:", emailError);
      }

      return {
        success: true,
        message: emailSent
          ? "Technician verified successfully and notification email sent"
          : "Technician verified successfully but email notification failed",
      };
    } catch (error) {
      console.log("Error during technician verification:", error);
      return {
        success: false,
        message: "An error occurred during technician verification",
      };
    }
  }

  async rejectTechnician(
    technicianId: string,
    reason?: string
  ): Promise<RejectTechnicianResponse> {
    try {
      console.log("Rejecting technician in service layer:", technicianId);

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
      if (!technician) {
        return { success: false, message: "Technician not found" };
      }

      const rejectionResult = await this._technicianRepository.rejectTechnician(
        technicianId
      );
      if (!rejectionResult.success) {
        return { success: false, message: rejectionResult.message };
      }

      let emailSent = false;
      try {
        await this._emailService.sendTechnicianRejectionEmail(
          technician.email,
          technician.username,
          reason || "Application did not meet our current requirements"
        );
        emailSent = true;
        console.log("Rejection email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending rejection email:", emailError);
      }

      return {
        success: true,
        message: emailSent
          ? "Technician application rejected successfully and notification email sent"
          : "Technician application rejected successfully but email notification failed",
      };
    } catch (error) {
      console.log("Error during technician rejection:", error);
      return {
        success: false,
        message: "An error occurred during technician rejection",
      };
    }
  }
}

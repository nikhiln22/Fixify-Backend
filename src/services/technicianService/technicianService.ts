import { ItechnicianService } from "../../interfaces/Iservices/ItechnicianService/ItechnicianService";
import { IjobDesignationRepository } from "../../interfaces/Irepositories/IjobDesignationRepository";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import {
  getJobDesignationsResponse,
  TechicianQualification,
  TechnicianProfileResponse,
  TechnicianQualificationUpdateResponse,
} from "../../interfaces/DTO/IServices/Itechnicianservices.dto/technicianService.dto";
import { ItechnicianRepository } from "../../interfaces/Irepositories/ItechnicianRepository";
import { IFileUploader } from "../../interfaces/IfileUploader/IfileUploader";

@injectable()
export class TechnicianService implements ItechnicianService {
  constructor(
    @inject("IjobDesignationRepository")
    private jobDesignationRepository: IjobDesignationRepository,
    @inject("ItechnicianRepository")
    private technicianRepository: ItechnicianRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async getJobDesignations(): Promise<getJobDesignationsResponse> {
    try {
      console.log(
        "entering the get job designation services from the technician service"
      );
      const designations =
        await this.jobDesignationRepository.getAllDesignations();
      console.log(
        "designations from the getjobdesignations function in the technician service:",
        designations
      );

      const designationNames = designations
        .filter((d) => d.Status === true)
        .map((d) => d.designation);
      console.log("designationNames:", designationNames);
      return {
        message: "job designations fetched successfully",
        success: true,
        designation: designationNames,
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("error fetching job deignations:", error);
      return {
        message: "error occured while fetchning the job designations",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async submitTechnicianQualifications(
    technicianId: string,
    qualificationData: TechicianQualification
  ): Promise<TechnicianQualificationUpdateResponse> {
    try {
      console.log(
        "Processing the technician qualification in the service layer"
      );

      const qualificationDataToSave: any = {
        experience: qualificationData.experience,
        designation: qualificationData.designation,
        about: qualificationData.about,
      };

      if (qualificationData.profilePhoto) {
        const profilePhotoUrl = await this.fileUploader.uploadFile(
          qualificationData.profilePhoto.path,
          { folder: "fixify/technicians/profile" }
        );
        if (profilePhotoUrl) {
          qualificationDataToSave.profilePhoto = profilePhotoUrl;
        }
      }

      if (
        qualificationData.certificates &&
        qualificationData.certificates.length > 0
      ) {
        const certificateUrls: string[] = [];
        for (const certificate of qualificationData.certificates) {
          const certificateUrl = await this.fileUploader.uploadFile(
            certificate.path,
            { folder: "fixify/technicians/certificates" }
          );
          if (certificateUrl) {
            certificateUrls.push(certificateUrl);
          }
        }
        if (certificateUrls.length > 0) {
          qualificationDataToSave.certificates = certificateUrls;
        }
      }

      const result =
        await this.technicianRepository.updateTechnicianQualification(
          technicianId,
          qualificationDataToSave
        );

      console.log("result from the technician service:", result);

      return {
        message: "Qualification submitted successfully",
        success: true,
        status: HTTP_STATUS.OK,
        technician: result.technician,
      };
    } catch (error) {
      console.error("Error submitting technician qualification:", error);
      return {
        message: "Failed to submit qualification",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse> {
    try {
      console.log("Fetching technician profile in service layer for ID:", technicianId);
      
      const result = await this.technicianRepository.getTechnicianById(technicianId);
      
      if (!result.success || !result.technicianData) {
        return {
          message: result.message || "Technician not found",
          success: false,
          status: HTTP_STATUS.NOT_FOUND
        };
      }
      
      return {
        message: "Technician profile fetched successfully",
        success: true,
        status: HTTP_STATUS.OK,
        technician: {
          username: result.technicianData.username,
          email: result.technicianData.email,
          phone: result.technicianData.phone,
          is_verified: result.technicianData.is_verified,
          yearsOfExperience: result.technicianData.yearsOfExperience,
          Designation: result.technicianData.Designation,
          About: result.technicianData.About,
          image: result.technicianData.image,
          certificates: result.technicianData.certificates
        }
      };
    } catch (error) {
      console.error("Error fetching technician profile:", error);
      return {
        message: "Failed to fetch technician profile",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}

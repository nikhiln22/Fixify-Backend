import {
  getJobDesignationsResponse,
  TechnicianProfileResponse,
} from "../../DTO/IServices/Itechnicianservices.dto/technicianService.dto";

export interface ItechnicianService {
  getJobDesignations(): Promise<getJobDesignationsResponse>;

  submitTechnicianQualifications(
    technicianId: String,
    qualificationData: {
      experience: string;
      designation: string;
      about: string;
      profilePhoto?: Express.Multer.File;
      certificates?: Express.Multer.File[];
    }
  ): Promise<any>;

  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;
}

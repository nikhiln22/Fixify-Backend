import { getJobDesignationsResponse } from "../../DTO/IServices/technicianService.dto";

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
  }
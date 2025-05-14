import {
  getJobDesignationsResponse,
  TechnicianProfileResponse,
  getCityLocationsResponse,
  getLocationsByCityResponse,
} from "../../DTO/IServices/Itechnicianservices.dto/technicianService.dto";

export interface ItechnicianService {
  getJobDesignations(): Promise<getJobDesignationsResponse>;

  getCityLocations(): Promise<getCityLocationsResponse>;

  getLocationsByCity(city: string): Promise<getLocationsByCityResponse>;

  submitTechnicianQualifications(
    technicianId: String,
    qualificationData: {
      experience: string;
      designation: string;
      about: string;
      city: string;
      preferredWorkLocation: string;
      profilePhoto?: Express.Multer.File;
      certificates?: Express.Multer.File[];
    }
  ): Promise<any>;

  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;
}

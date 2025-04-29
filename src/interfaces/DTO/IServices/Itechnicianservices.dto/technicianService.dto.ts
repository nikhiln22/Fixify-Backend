export interface getJobDesignationsResponse {
  designation?: string[];
  message: string;
  success: Boolean;
  status: number;
}

export interface TechicianQualification {
  experience: string;
  designation: string;
  about: string;
  profilePhoto: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

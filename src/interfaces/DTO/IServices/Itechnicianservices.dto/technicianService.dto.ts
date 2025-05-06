
import { Itechnician } from "../../../Models/Itechnician";

export interface getJobDesignationsResponse {
  designation?: string[];
  message: string;
  success: Boolean;
  status: number;
}

export interface getCityLocationsResponse {
  cities?: string[];
  message: string;
  success: Boolean;
  status: number;
}

export interface ILocationWithCity {
  locationName: string;
  pincode: string;
  cityName: string;
}

export interface getLocationsByCityResponse {
  success: boolean;
  message?: string;
  status: number;
  locations?: ILocationWithCity[];
}

export interface TechnicianQualification {
  experience: string;
  designation: string;
  about: string;
  city: string;
  preferredWorkLocation: string;
  profilePhoto: Express.Multer.File;
  certificates?: Express.Multer.File[];
}

export interface TechnicianQualificationUpdateResponse {
  success: boolean;
  status: number;
  message: string;
  technician?: Pick<
    Itechnician,
    | "yearsOfExperience"
    | "Designation"
    | "About"
    | "image"
    | "certificates"
    | "city"
    | "preferredWorkLocation"
  >;
}

export interface TechnicianProfileResponse {
  message: string;
  success: boolean;
  status: number;
  technician?: {
    username?: string;
    email?: string;
    phone?: number;
    is_verified?: boolean;
    yearsOfExperience?: number;
    Designation?: string;
    city?: string;
    preferredWorkLocation?: string;
    About?: string;
    image?: string;
    certificates?: string[];
  };
}
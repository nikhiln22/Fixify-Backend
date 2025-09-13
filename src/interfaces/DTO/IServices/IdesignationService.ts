import { IDesignation } from "../../Models/Idesignation";

export interface DesignationResponse {
  success: boolean;
  message: string;
  data?: IDesignation | null;
}

export interface ToggleDesignationResponse {
  success: boolean;
  message: string;
  data?: {
    designationId: string;
    status: string;
  };
}

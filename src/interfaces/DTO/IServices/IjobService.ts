import { IJobDesignation } from "../../Models/IjobDesignation";

export interface DesignationResponse {
  success: boolean;
  message: string;
  data?: IJobDesignation | null;
}

export interface ToggleDesignationResponse {
  success: boolean;
  message: string;
  data?: {
    designationId: string;
    status: string;
  };
}

import { IJobDesignation } from "../../Models/IjobDesignation";

export interface DesignationResponse {
  success: boolean;
  message: string;
  data?: IJobDesignation | null;
}

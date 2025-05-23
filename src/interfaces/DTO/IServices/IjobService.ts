import { IjobDesignation } from "../../Models/IjobDesignation";

export interface DesignationResponse {
  success?:boolean,
  status: number;
  message: string;
  data?: IjobDesignation | null;
}

import { IjobDesignation } from "../../Models/IjobDesignation";

export interface DesignationResponse {
  success:boolean,
  message: string;
  data?: IjobDesignation | null;
}

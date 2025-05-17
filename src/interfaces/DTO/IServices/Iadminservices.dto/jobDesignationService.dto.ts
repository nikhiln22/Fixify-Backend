import { IjobDesignation } from "../../../Models/IjobDesignation";

export interface DesignationResponseDTO {
  success?:boolean,
  status: number;
  message: string;
  data?: IjobDesignation | null;
}

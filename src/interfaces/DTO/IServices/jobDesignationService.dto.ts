import { IjobDesignation } from "../../Models/IjobDesignation"; 

export interface AddDesignationResponseDTO {
    status: number;
    message: string;
    designation?: IjobDesignation | IjobDesignation[]; 
    total?: number; 
    totalPages?: number;
  }
  
import { Itechnician } from "../../../Models/Itechnician";

export interface PaginatedApplicantsResponse {
  status: number;
  message: string;
  applicants?: Itechnician[];
  total?: number;
  totalPages?: number;
}
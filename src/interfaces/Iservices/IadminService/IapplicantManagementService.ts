import { PaginatedApplicantsResponse } from "../../DTO/IServices/Iadminservices.dto/applicantsManagement.dto";

export interface IapplicantManagementService {
  getPaginatedUnverifiedTechnicians(
    page: number
  ): Promise<PaginatedApplicantsResponse>;
}

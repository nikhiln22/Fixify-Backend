import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { IApplicantService } from "../interfaces/Iservices/IapplicantService";
import { IAddressService } from "../interfaces/Iservices/IaddressService";

@injectable()
export class ApplicantController {
  constructor(
    @inject("IApplicantService") private _applicantService: IApplicantService,
    @inject("IAddressService") private _addressService: IAddressService
  ) {}
  async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the applicants");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const serviceResponse = await this._applicantService.getAllApplicants({
        page,
        limit,
      });

      console.log(
        "result from the fetching all applicants from admin controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch applicants"
            )
          );
      }
    } catch (error) {
      console.error(
        "Error in fetching all applicants in admin controller:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching applicants"));
    }
  }

  async getApplicantDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering technician profile fetch");
      const applicantId = req.params.applicantId;

      if (!applicantId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._applicantService.getApplicantDetails(
        applicantId
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
              serviceResponse.message
            )
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch applciant details"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching applicant detail:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async approveApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entered verify applicant function in admin controller");
      const applicantId = req.params.applicantId;
      console.log(
        "Applicant ID from verify applicant controller:",
        applicantId
      );

      const serviceResponse = await this._applicantService.verifyTechnician(
        applicantId
      );
      console.log("Response from verifying the applicant:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify applicant"
            )
          );
      }
    } catch (error) {
      console.log("Error occurred while verifying the applicant:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async rejectApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entered reject applicant function in admin controller");
      const applicantId = req.params.applicantId;
      const { reason } = req.body;

      console.log(
        "Applicant ID from reject applicant controller:",
        applicantId
      );
      console.log("Rejection reason:", reason);

      const serviceResponse = await this._applicantService.rejectTechnician(
        applicantId,
        reason
      );
      console.log("Response from rejecting the applicant:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to reject applicant"
            )
          );
      }
    } catch (error) {
      console.log("Error occurred while rejecting the applicant:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { IAddressService } from "../interfaces/Iservices/IaddressService";

@injectable()
export class AddressController {
  constructor(
    @inject("IAddressService") private _addressService: IAddressService
  ) {}
  async getAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the controller for fetching the user address");
      const userId = req.user?.id;
      console.log("userId from the address fetching controller:", userId);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._addressService.getUserAddresses(
        userId
      );
      console.log(
        "response from the user controller fetching the user address:",
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
              serviceResponse.message || "Failed to fetch addresses"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching the user address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the user address");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const addressData = req.body;
      console.log("address Data received:", req.body);

      const serviceResponse = await this._addressService.addAddress(
        userId,
        addressData
      );

      console.log("response from the addAddress service:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to add address"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding new address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async deleteAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("deleting the already existing address of the user");
      const userId = req.user?.id;
      const addressId = req.params.addressId;
      console.log("userId from the address deleting controller:", userId);
      console.log("addressId from the address deleting controller:", addressId);

      if (!userId || !addressId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._addressService.deleteAddress(
        addressId,
        userId
      );
      console.log(
        "response from the user controller deleting the user address:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(null, serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to delete address"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while deleting the address:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}

import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { HTTP_STATUS } from "../constants/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { Roles } from "../config/roles";
import { AddAddressDto } from "../interfaces/DTO/IServices/IaddressService";

@injectable()
export class AddressController {
  constructor(
    @inject("IAddressService") private _addressService: IAddressService
  ) {}

  async getAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the controller for fetching the address");
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      console.log("userId from the address fetching controller:", userId);
      console.log("role from the address fetching controller:", role);

      if (!userId || !role) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const ownerModel = role.toLowerCase() as "user" | "technician";

      if (!["user", "technician"].includes(ownerModel)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Invalid user role"));
        return;
      }

      const serviceResponse = await this._addressService.getOwnerAddresses(
        userId,
        ownerModel
      );

      console.log(
        "response from the address controller fetching the addresses:",
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
      console.log("error occurred while fetching the addresses:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async addAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the address");
      const userId = req.user?.id;
      const role = req.user?.role as Roles;

      console.log("userId from the add address controller:", userId);
      console.log("role from the add address controller:", role);

      if (!userId || !role) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const ownerModel = role.toLowerCase() as "user" | "technician";

      if (!["user", "technician"].includes(ownerModel)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Invalid user role"));
        return;
      }
      const addressData: AddAddressDto = {
        addressType: req.body.addressType,
        houseNumber: req.body.houseNumber,
        landmark: req.body.landmark,
        fullAddress: req.body.fullAddress,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        ownerId: userId,
        ownerModel: ownerModel,
      };

      console.log("Mapped AddAddressDto:", addressData);

      const serviceResponse = await this._addressService.addAddress(
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
      console.log("deleting the already existing address");
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      const addressId = req.params.addressId;

      console.log("userId from the address deleting controller:", userId);
      console.log("role from the address deleting controller:", role);
      console.log("addressId from the address deleting controller:", addressId);

      if (!userId || !role || !addressId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const ownerModel = role.toLowerCase() as "user" | "technician";

      if (!["user", "technician"].includes(ownerModel)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Invalid user role"));
        return;
      }

      const serviceResponse = await this._addressService.deleteAddress(
        addressId,
        userId,
        ownerModel
      );

      console.log(
        "response from the address controller deleting the address:",
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

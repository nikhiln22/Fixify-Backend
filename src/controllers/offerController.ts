import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { IBookingService } from "../interfaces/Iservices/IbookingService";

@injectable()
export class OfferController {
  constructor(
    @inject("IOfferService") private _offerService: IOfferService,
    @inject("IBookingService") private _bookingService: IBookingService
  ) {}

  async addOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the offer controller function that adds the offer"
      );
      console.log("received Data:", req.body);

      const offerData = {
        title: req.body.title,
        description: req.body.description,
        offer_type: req.body.offer_type,
        discount_type: req.body.discount_type,
        discount_value: req.body.discount_value,
        max_discount: req.body.max_discount,
        min_booking_amount: req.body.min_booking_amount,
        serviceId: req.body.serviceId,
        valid_until: req.body.valid_until
          ? new Date(req.body.valid_until)
          : undefined,
      };

      console.log("processed offer data:", offerData);

      const serviceResponse = await this._offerService.addOffer(offerData);

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
              serviceResponse.message || "Failed to add offer"
            )
          );
      }
    } catch (error) {
      console.error("Error in addOffer controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllOffers(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the offers for the admin");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const filterStatus = req.query.filterStatus
        ? (req.query.filterStatus as string)
        : undefined;

      const serviceResponse = await this._offerService.getAllOffers({
        page,
        limit,
        search,
        filterStatus,
      });
      console.log("response in the fetching all offers:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch offers"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching offers:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async blockOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the block offer function in the admin controller"
      );
      const { id } = req.params;
      console.log("offerId in the block offer function:", id);

      const serviceResponse = await this._offerService.blockOffer(id);
      console.log("response from the block offer function:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to block offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    try {
      console.log("updating the existing offer from the admin controller:");
      const offerId = req.params.offerId;
      console.log("offerId:", offerId);

      if (!offerId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Offer ID is required"));
        return;
      }

      console.log("req.body:", req.body);

      const {
        title,
        description,
        offer_type,
        discount_type,
        discount_value,
        max_discount,
        min_booking_amount,
        serviceId,
        valid_until,
      } = req.body;

      console.log("offer_type:", offer_type);

      const updateData: {
        title?: string;
        description?: string;
        offer_type?: string;
        discount_type?: number;
        discount_value?: number;
        max_discount?: number;
        min_booking_amount?: number;
        serviceId?: string;
        valid_until?: Date;
      } = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (offer_type !== undefined) updateData.offer_type = offer_type;
      if (discount_type !== undefined) updateData.discount_type = discount_type;
      if (discount_value !== undefined)
        updateData.discount_value = discount_value;
      if (max_discount !== undefined) updateData.max_discount = max_discount;
      if (min_booking_amount !== undefined)
        updateData.min_booking_amount = min_booking_amount;
      if (serviceId !== undefined) updateData.serviceId = serviceId;
      if (valid_until !== undefined) updateData.valid_until = valid_until;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._offerService.updateOffer(
        offerId,
        updateData
      );
      console.log(
        "after updating the offer from the offer service:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to update offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while updating the offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getUserOffers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("fetching the offers for the user");
      const userId = req.user?.id;
      console.log("userId in the user controller:", userId);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._offerService.getUserOffers(userId);
      console.log("response in the fetching all offers:", serviceResponse);
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
              serviceResponse.message || "Failed to fetch offers"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching offers:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async applyBestOffer(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entered into the apply best offer in the user controller function"
      );
      const userId = req.user?.id;
      console.log(
        "userId in the applybest offer method in the user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      console.log("received Data:", req.body);

      const { serviceId, totalAmount } = req.body;

      if (!serviceId || !totalAmount) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse("Service ID and total amount are required")
          );
        return;
      }

      const serviceResponse = await this._bookingService.applyBestOffer(
        userId,
        serviceId,
        totalAmount
      );

      console.log(
        "response in applying the best offer in the user controller:",
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
              serviceResponse.message || "Failed to apply best offer"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while applying best offer:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}

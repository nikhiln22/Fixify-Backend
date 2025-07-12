import { offerData } from "../interfaces/DTO/IServices/IofferService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { IOffer } from "../interfaces/Models/Ioffers";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject("IOfferRepository") private offerRepository: IOfferRepository
  ) {}

  async addOffer(data: offerData): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IOffer;
  }> {
    try {
      console.log("entering to the service function that adds the offer");
      console.log("data received:", data);

      const response = await this.offerRepository.addOffer(data);
      console.log(
        "response from the offer repository in the offer service:",
        response
      );

      return {
        success: true,
        status: HTTP_STATUS.CREATED,
        message: "Offer created successfully",
        data: response,
      };
    } catch (error) {
      console.log("error occured while add new offer:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to create offer",
      };
    }
  }

  async getAllOffers(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      offers: IOffer[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all the offers");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.offerRepository.getAllOffers({
        page,
        limit,
        search: options.search,
        filterStatus: options.filterStatus,
      });

      console.log("result from the offer service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Offers fetched successfully",
        data: {
          offers: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching offers:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching offers",
      };
    }
  }

  async blockOffer(
    id: string
  ): Promise<{ message: string; status: number; offer?: IOffer }> {
    try {
      console.log("entering the service layer that blocks the offer:", id);
      const offer = await this.offerRepository.findOfferById(id);
      console.log("offer fetched from repository:", offer);

      if (!offer) {
        return {
          message: "offer not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const newStatus = !offer.status;
      let response = await this.offerRepository.blockOffer(id, newStatus);
      console.log(
        "Response after toggling offer status from the offer repository:",
        response
      );

      return {
        message: `Offer successfully ${newStatus ? "unblocked" : "blocked"}`,
        offer: { ...offer.toObject(), status: newStatus },
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.error("Error toggling offer status:", error);
      return {
        message: "Failed to toggle offer status",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async updateOffer(
    offerId: string,
    updateData: {
      title?: string;
      description?: string;
      offer_type?: string;
      discount_type?: number;
      discount_value?: number;
      max_discount?: number;
      min_booking_amount?: number;
      service_id?: string;
      valid_until?: Date;
    }
  ): Promise<{
    status: number;
    success: boolean;
    message: string;
    data?: IOffer;
  }> {
    try {
      console.log(
        "entering the offer service which updates the existing offer added by the admin"
      );

      const offer = await this.offerRepository.findOfferById(offerId);
      if (!offer) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Offer not found",
        };
      }

      const updatedOffer = await this.offerRepository.updateOffer(
        offerId,
        updateData
      );

      if (!updatedOffer) {
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update Offer",
        };
      }

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Offer updated successfully",
        data: updatedOffer,
      };
    } catch (error) {
      console.error("Error updating offer:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to update offer",
      };
    }
  }
}

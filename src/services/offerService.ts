import { OfferData } from "../interfaces/DTO/IServices/IofferService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { IOffer } from "../interfaces/Models/Ioffers";
import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject("IOfferRepository") private offerRepository: IOfferRepository
  ) {}

  async addOffer(data: OfferData): Promise<{
    success: boolean;
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
        message: "Offer created successfully",
        data: response,
      };
    } catch (error) {
      console.log("error occured while add new offer:", error);
      return {
        success: false,
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
        message: "Something went wrong while fetching offers",
      };
    }
  }

  async blockOffer(id: string): Promise<{ message: string; offer?: IOffer }> {
    try {
      console.log("entering the service layer that blocks the offer:", id);
      const offer = await this.offerRepository.findOfferById(id);
      console.log("offer fetched from repository:", offer);

      if (!offer) {
        return {
          message: "offer not found",
        };
      }

      const newStatus = !offer.status;
      const response = await this.offerRepository.blockOffer(id, newStatus);
      console.log(
        "Response after toggling offer status from the offer repository:",
        response
      );

      return {
        message: `Offer successfully ${newStatus ? "unblocked" : "blocked"}`,
        offer: { ...offer.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling offer status:", error);
      return {
        message: "Failed to toggle offer status",
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
          message: "Failed to update Offer",
        };
      }

      return {
        success: true,
        message: "Offer updated successfully",
        data: updatedOffer,
      };
    } catch (error) {
      console.error("Error updating offer:", error);
      return {
        success: false,
        message: "Failed to update offer",
      };
    }
  }
}

import { OfferData } from "../interfaces/DTO/IServices/IofferService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { IOffer } from "../interfaces/Models/Ioffers";
import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject("IOfferRepository") private _offerRepository: IOfferRepository,
    @inject("IBookingRepository") private _bookingRepository: IBookingRepository
  ) {}

  async addOffer(data: OfferData): Promise<{
    success: boolean;
    message: string;
    data?: IOffer;
  }> {
    try {
      console.log("entering to the service function that adds the offer");
      console.log("data received:", data);

      const response = await this._offerRepository.addOffer(data);
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
      console.log("Function fetching all the offers for admin");
      const page = options.page;
      const limit = options.limit;

      const result = await this._offerRepository.getAllOffers({
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
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
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

  async getUserOffers(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: Partial<IOffer>[];
  }> {
    try {
      console.log(
        "entered to the offers fetching for the user in offer service:",
        userId
      );

      console.log("checking whether this is a new user:", userId);
      const completedBookings = await this._bookingRepository.countUserBookings(
        userId
      );

      const isFirstTimeUser = completedBookings === 0;

      console.log(
        "user bookings count:",
        completedBookings,
        "is First Time:",
        isFirstTimeUser
      );

      const result = await this._offerRepository.getUserOffers(isFirstTimeUser);

      const transformedOffers: Partial<IOffer>[] = result.map((offer) => ({
        title: offer.title,
        description: offer.description,
        offer_type: offer.offer_type,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        max_discount: offer.max_discount,
        min_booking_amount: offer.min_booking_amount,
        valid_until: offer.valid_until,
        display_discount:
          offer.discount_type === "percentage"
            ? `${offer.discount_value}% OFF`
            : `₹${offer.discount_value} OFF`,
      }));

      console.log(
        "result from the offer repository for user offers:",
        transformedOffers
      );

      return {
        success: true,
        message: "User offers fetched successfully",
        data: transformedOffers,
      };
    } catch (error) {
      console.error("Error fetching user offers:", error);
      return {
        success: false,
        message: "Failed to fetch user offers",
      };
    }
  }

  async blockOffer(id: string): Promise<{
    success: boolean;
    message: string;
    data?: { _id: string; status: string };
  }> {
    try {
      console.log("entering the service layer that blocks the offer:", id);
      const offer = await this._offerRepository.findOfferById(id);
      console.log("offer fetched from repository:", offer);

      if (!offer) {
        return {
          success: false,
          message: "offer not found",
        };
      }

      const newStatus = offer.status === "Active" ? "Blocked" : "Active";
      const response = await this._offerRepository.blockOffer(id, newStatus);
      console.log(
        "Response after toggling offer status from the offer repository:",
        response
      );

      if (!response) {
        return {
          success: false,
          message: "failed to update the coupon",
        };
      }

      return {
        success: true,
        message: `Offer ${
          newStatus === "Active" ? "unblocked" : "blocked"
        } successfully`,
        data: {
          _id: response._id,
          status: response.status,
        },
      };
    } catch (error) {
      console.error("Error toggling offer status:", error);
      return {
        success: false,
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
      serviceId?: string;
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

      const offer = await this._offerRepository.findOfferById(offerId);
      if (!offer) {
        return {
          success: false,
          message: "Offer not found",
        };
      }

      const updatedOffer = await this._offerRepository.updateOffer(
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

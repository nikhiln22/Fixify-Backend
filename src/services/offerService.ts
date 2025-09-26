import { OfferData } from "../interfaces/DTO/IServices/IofferService";
import { IOfferService } from "../interfaces/Iservices/IofferService";
import { IOffer } from "../interfaces/Models/Ioffers";
import { inject, injectable } from "tsyringe";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IServiceRepository } from "../interfaces/Irepositories/IserviceRepository";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject("IOfferRepository") private _offerRepository: IOfferRepository,
    @inject("IBookingRepository")
    private _bookingRepository: IBookingRepository,
    @inject("IServiceRepository") private _serviceRepository: IServiceRepository
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

  async applyBestOffer(
    userId: string,
    serviceId: string,
    totalAmount?: number,
    hoursWorked?: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      offerId: string;
      offerApplied: boolean;
      offerName: string;
      discountAmount: number;
      finalAmount: number;
      discountValue: number;
      maxDiscount?: number;
      discountType: string;
      offerType: string;
      minBookingAmount?: number;
    };
  }> {
    try {
      console.log(
        "entering to the apply best offer function in the offer service:"
      );
      console.log("userId:", userId);
      console.log("serviceId:", serviceId);
      console.log("totalAmount:", totalAmount);
      console.log("hoursWorked:", hoursWorked);

      const service = await this._serviceRepository.findServiceById(serviceId);
      console.log("service in the best offer apply function:", service);

      if (!service) {
        return {
          success: false,
          message: "Service not found",
        };
      }

      let actualTotalAmount = 0;

      if (service.serviceType === "fixed") {
        if (!service.price) {
          return {
            success: false,
            message: "Price not defined for fixed service",
          };
        }
        actualTotalAmount = service.price;
      } else if (service.serviceType === "hourly") {
        if (!service.hourlyRate) {
          return {
            success: false,
            message: "Hourly rate not defined for hourly service",
          };
        }

        if (!hoursWorked || hoursWorked <= 0) {
          return {
            success: false,
            message: "Hours worked must be provided for hourly services",
          };
        }

        actualTotalAmount = service.hourlyRate * hoursWorked;
      } else {
        return {
          success: false,
          message: "Invalid service type",
        };
      }

      const amountToUse = totalAmount || actualTotalAmount;

      console.log("Final amount to use for offer calculation:", amountToUse);
      console.log("Service type:", service.serviceType);

      const userBookingsCount = await this._bookingRepository.countUserBookings(
        userId
      );
      console.log("user bookings count:", userBookingsCount);

      const isFirstTimeUser = userBookingsCount === 0;
      console.log("isFirstTimeUser:", isFirstTimeUser);

      let bestOffer: IOffer | null = null;
      let discountAmount = 0;

      if (isFirstTimeUser) {
        const firstTimeOffer = await this._offerRepository.getOfferByType(
          "first_time_user"
        );
        console.log("firstTimeOffer:", firstTimeOffer);

        if (
          firstTimeOffer &&
          this.isOfferEligible(firstTimeOffer, amountToUse)
        ) {
          bestOffer = firstTimeOffer;
          discountAmount = this.calculateDiscount(firstTimeOffer, amountToUse);
          console.log("Applied First Time Offer:", bestOffer.title);
        }
      }

      if (!bestOffer) {
        const categoryOffer =
          await this._offerRepository.getOfferByServiceCategory(
            service.category.toString()
          );
        console.log("categoryOffer:", categoryOffer);

        if (categoryOffer && this.isOfferEligible(categoryOffer, amountToUse)) {
          bestOffer = categoryOffer;
          discountAmount = this.calculateDiscount(categoryOffer, amountToUse);
          console.log("Applied Service Category Offer:", bestOffer.title);
        }
      }

      if (!bestOffer) {
        const globalOffer = await this._offerRepository.getOfferByType(
          "global"
        );
        console.log("globalOffer:", globalOffer);

        if (globalOffer && this.isOfferEligible(globalOffer, amountToUse)) {
          bestOffer = globalOffer;
          discountAmount = this.calculateDiscount(globalOffer, amountToUse);
          console.log("Applied Global Offer:", bestOffer.title);
        }
      }

      const finalAmount = amountToUse - discountAmount;

      if (!bestOffer) {
        return {
          message: "No offers available for this service",
          success: false,
        };
      }

      console.log("Offer application result:", {
        serviceType: service.serviceType,
        originalAmount: amountToUse,
        hoursWorked: hoursWorked || "N/A",
        offerApplied: !!bestOffer,
        offerName: bestOffer?.title,
        discountAmount,
        finalAmount,
      });

      return {
        success: true,
        message: `${bestOffer.title} applied successfully`,
        data: {
          offerId: bestOffer._id,
          offerApplied: true,
          offerName: bestOffer.title,
          discountAmount,
          finalAmount,
          discountValue: bestOffer.discount_value,
          maxDiscount: bestOffer.max_discount,
          discountType: bestOffer.discount_type,
          offerType: bestOffer.offer_type,
          minBookingAmount: bestOffer.min_booking_amount,
        },
      };
    } catch (error) {
      console.log("Error in applyBestOffer:", error);
      return {
        success: false,
        message: "Failed to apply best offer",
      };
    }
  }

  private isOfferEligible(offer: IOffer, totalAmount: number): boolean {
    try {
      if (!offer.status) {
        console.log(`Offer ${offer.title} is not active`);
        return false;
      }

      const now = new Date();

      if (offer.valid_until && new Date(offer.valid_until) < now) {
        console.log(`Offer ${offer.title} has expired`);
        return false;
      }

      if (offer.min_booking_amount && totalAmount < offer.min_booking_amount) {
        console.log(
          `Offer ${offer.title} requires minimum booking of ₹${offer.min_booking_amount}, but total is ₹${totalAmount}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking offer eligibility:", error);
      return false;
    }
  }

  private calculateDiscount(offer: IOffer, totalAmount: number): number {
    try {
      let discount = 0;

      if (offer.discount_type === "percentage") {
        discount = (totalAmount * offer.discount_value) / 100;

        if (offer.max_discount && discount > offer.max_discount) {
          discount = offer.max_discount;
        }
      } else if (offer.discount_type === "flat_amount") {
        discount = Math.min(offer.discount_value, totalAmount);
      }

      console.log(`Calculated discount for ${offer.title}:`, {
        discountType: offer.discount_type,
        discountValue: offer.discount_value,
        totalAmount,
        calculatedDiscount: discount,
      });

      return Math.min(discount, totalAmount);
    } catch (error) {
      console.error("Error calculating discount:", error);
      return 0;
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

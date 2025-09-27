import { OfferData } from "../DTO/IServices/IofferService";
import { IOffer } from "../Models/Ioffers";

export interface IOfferService {
  addOffer(data: OfferData): Promise<{
    success: boolean;
    message: string;
    data?: IOffer;
  }>;
  getAllOffers(options: {
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
  }>;
  blockOffer(id: string): Promise<{
    message: string;
    success: boolean;
    data?: {
      _id: string;
      status: string;
    };
  }>;
  updateOffer(
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
  }>;
  getUserOffers(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: Partial<IOffer>[];
  }>;
  applyBestOffer(
    userId: string,
    serviceId: string,
    totalAmount: number
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
  }>;
}

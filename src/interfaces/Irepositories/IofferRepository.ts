import { OfferData } from "../DTO/IServices/IofferService";
import { IOffer } from "../Models/Ioffers";

export interface IOfferRepository {
  addOffer(data: OfferData): Promise<IOffer>;
  getAllOffers(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    data: IOffer[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  blockOffer(id: string, status: string): Promise<IOffer | null>;
  findOfferById(id: string): Promise<IOffer | null>;
  updateOffer(
    id: string,
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
  ): Promise<IOffer | null>;
  getUserOffers(isFirstTimeUser: boolean): Promise<IOffer[]>;
  getOfferByType(offerType: string): Promise<IOffer | null>;
  getOfferByServiceCategory(categoryId: string): Promise<IOffer | null>;
}

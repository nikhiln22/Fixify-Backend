import { BaseRepository } from "./baseRepository";
import { IOffer } from "../interfaces/Models/Ioffers";
import offer from "../models/offerModel";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";
import { injectable } from "tsyringe";
import { OfferData } from "../interfaces/DTO/IServices/IofferService";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class OfferRepository
  extends BaseRepository<IOffer>
  implements IOfferRepository
{
  constructor() {
    super(offer);
  }

  async addOffer(data: OfferData): Promise<IOffer> {
    try {
      console.log("creating offer in repository:", data);
      const newOffer = await this.create(data);
      return newOffer;
    } catch (error) {
      console.error("Error creating offer in repository:", error);
      throw error;
    }
  }

  async getAllOffers(options: {
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
  }> {
    try {
      console.log(
        "entering the function which fetches all the offers for admin"
      );
      console.log("Options received:", options);

      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<IOffer> = {};

      if (options.filterStatus) {
        if (options.filterStatus === "active") {
          filter.status = "Active";
        } else if (options.filterStatus === "blocked") {
          filter.status = "Blocked";
        }
      }

      if (options.search) {
        filter.$or = [
          { title: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          sort: { createdAt: -1 },
        })) as { data: IOffer[]; total: number };

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allOffers = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as IOffer[];

        console.log("all offers without pagination:", allOffers);
        return {
          data: allOffers,
          total: allOffers.length,
          page: 1,
          limit: allOffers.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("error occurred while fetching the admin offers:", error);
      throw new Error("Failed to fetch the admin offers");
    }
  }

  async getOfferByType(offerType: string): Promise<IOffer | null> {
    try {
      console.log("fetching offer by type:", offerType);

      const filter: FilterQuery<IOffer> = {
        offer_type: offerType,
        status: "Active",
        valid_until: { $gte: new Date() },
      };

      const offer = await this.findOne(filter);
      console.log("fetched offer by type:", offer);
      return offer;
    } catch (error) {
      console.error("Error fetching offer by type:", error);
      return null;
    }
  }

  async getOfferByServiceCategory(categoryId: string): Promise<IOffer | null> {
    try {
      console.log("fetching offer by service category:", categoryId);

      const filter: FilterQuery<IOffer> = {
        offer_type: "service_category",
        serviceId: new Types.ObjectId(categoryId),
        status: true,
        valid_until: { $gte: new Date() },
      };

      const offer = await this.findOne(filter);
      console.log("fetched offer by service category:", offer);
      return offer;
    } catch (error) {
      console.error("Error fetching offer by service category:", error);
      return null;
    }
  }

  async getUserOffers(isFirstTimeUser: boolean): Promise<IOffer[]> {
    try {
      console.log("entering the function which fetches offers for user");
      console.log("Is first time user:", isFirstTimeUser);

      const filter: FilterQuery<IOffer> = {
        status: "Active",
        valid_until: { $gte: new Date() },
      };

      if (isFirstTimeUser) {
        console.log("Showing offers for first-time user");
        filter.$or = [
          { offer_type: "global" },
          { offer_type: "service_category" },
          { offer_type: "first_time_user" },
        ];
      } else {
        console.log("Showing offers for existing user");
        filter.$or = [
          { offer_type: "global" },
          { offer_type: "service_category" },
        ];
      }

      const result = await this.findAll(filter, { createdAt: -1 });

      console.log("data fetched from the offer repository for user:", {
        count: result.length,
        offers: result,
      });

      return result;
    } catch (error) {
      console.log("error occurred while fetching the user offers:", error);
      throw new Error("Failed to fetch the user offers");
    }
  }

  async blockOffer(id: string, status: string): Promise<IOffer | null> {
    try {
      const response = await this.updateOne({ _id: id }, { status: status });
      console.log("blocking the offer in the offer repository:", response);
      return response;
    } catch (error) {
      throw new Error("Failed to block offer: " + error);
    }
  }

  async findOfferById(id: string): Promise<IOffer | null> {
    try {
      const offer = await this.findById(id);
      console.log("fetched offer from the offer repository:", offer);
      return offer;
    } catch (error) {
      console.log("error occured while fetching the offer:", error);
      return null;
    }
  }

  async updateOffer(
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
  ): Promise<IOffer | null> {
    try {
      console.log(
        "entering to the offer repository that updates the offer data:",
        updateData
      );

      const updatedOffer = await this.updateOne(
        { _id: id },
        { $set: updateData }
      );
      console.log("updated offer in the offer repository:", updatedOffer);
      return updatedOffer;
    } catch (error) {
      console.error(`Error updating service:`, error);
      throw new Error(`Failed to update service: ${error}`);
    }
  }
}

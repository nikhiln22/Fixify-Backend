import { BaseRepository } from "./baseRepository";
import { IOffer } from "../interfaces/Models/Ioffers";
import offer from "../models/offerModel";
import { IOfferRepository } from "../interfaces/Irepositories/IofferRepository";
import { injectable } from "tsyringe";
import { offerData } from "../interfaces/DTO/IServices/IofferService";
import { FilterQuery } from "mongoose";

@injectable()
export class OfferRepository
  extends BaseRepository<IOffer>
  implements IOfferRepository
{
  constructor() {
    super(offer);
  }

  async addOffer(data: offerData): Promise<IOffer> {
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
      console.log("entering the function which fetches all the offers");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IOffer> = {};

      if (options.search) {
        filter.$or = [
          { title: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.filterStatus) {
        if (options.filterStatus === "active") {
          filter.status = true;
        } else if (options.filterStatus === "inactive") {
          filter.status = false;
        }
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IOffer[]; total: number };

      console.log("data fetched from the offer repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the offers:", error);
      throw new Error("Failed to fetch the offers");
    }
  }

  async blockOffer(id: string, status: boolean): Promise<void> {
    try {
      let response = await this.updateOne({ _id: id }, { status: status });
      console.log("blocking the offer in the offer repository:", response);
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
      service_id?: string;
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

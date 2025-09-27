import { IPartsRepository } from "../interfaces/Irepositories/IpartRepository";
import { IPart } from "../interfaces/Models/Ipart";
import { BaseRepository } from "./baseRepository";
import part from "../models/partModel";
import { AddPart, UpdatePart } from "../interfaces/DTO/IServices/IpartService";
import mongoose, { FilterQuery, Types } from "mongoose";

export class PartsRepository
  extends BaseRepository<IPart>
  implements IPartsRepository
{
  constructor() {
    super(part);
  }

  async addPart(data: AddPart): Promise<IPart | null> {
    try {
      console.log("entered addPart function in PartsRepository");
      console.log("data:", data);

      const partData = {
        ...data,
        services: data.services.map((id) => new mongoose.Types.ObjectId(id)),
      };

      const newPart = await this.create(partData);

      const populatedPart = await newPart.populate("services", "name");

      return populatedPart;
    } catch (error) {
      console.log("error occurred while adding new part", error);
      throw error;
    }
  }

  async getAllParts(options: {
    page?: number;
    limit?: number;
    search?: string;
    serviceId?: string;
    status?: string;
  }): Promise<{
    data: IPart[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the parts");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<IPart> = {};

      if (options.serviceId) {
        filter.services = new Types.ObjectId(options.serviceId);
      }

      if (options.search) {
        filter.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        filter.status = options.status;
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          sort: { createdAt: -1 },
          populate: [{ path: "services", select: "name" }],
        })) as { data: IPart[]; total: number };

        console.log("populated data from the part repository:", result);

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allParts = (await this.find(filter, {
          sort: { createdAt: -1 },
          populate: { path: "services", select: "name" },
        })) as IPart[];

        return {
          data: allParts,
          total: allParts.length,
          page: 1,
          limit: allParts.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("error occurred while fetching the data:", error);
      throw new Error("Failed to fetch the parts");
    }
  }

  async findPartById(id: string): Promise<IPart | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      throw new Error("Error finding part by ID: " + error);
    }
  }

  async updatePartStatus(
    partId: string,
    newStatus: string
  ): Promise<IPart | null> {
    try {
      console.log(`Updating part status to ${newStatus} for part ${partId}`);

      const updatedPart = await this.updateOne(
        { _id: partId },
        { status: newStatus }
      );

      console.log(`Part status update operation completed:`, updatedPart);
      return updatedPart;
    } catch (error) {
      console.log(`Error in repository while updating part status:`, error);
      throw new Error("Error occured while updating the part status:" + error);
    }
  }

  async updatePart(partId: string, data: UpdatePart): Promise<IPart | null> {
    try {
      console.log("entered updatePart function in PartsRepository");
      console.log("partId:", partId, "update data:", data);

      const updateData: Partial<IPart> = {
        name: data.name,
        description: data.description,
        price: data.price,
      };

      if (data.services && data.services.length > 0) {
        updateData.services = data.services.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      }

      console.log("prepared update data:", updateData);

      const updatedPart = await this.updateOne({ _id: partId }, updateData);

      if (!updatedPart) {
        console.log("Part not found or failed to update");
        return null;
      }

      const populatedPart = await updatedPart.populate("services", "name");

      console.log("updated and populated part:", populatedPart);
      return populatedPart;
    } catch (error) {
      console.log("error occurred while updating part:", error);
      throw new Error("Error occurred while updating the part: " + error);
    }
  }
}

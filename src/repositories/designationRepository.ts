import { FilterQuery } from "mongoose";
import { IDesignationRepository } from "../interfaces/Irepositories/IdesignationRepository";
import { IDesignation } from "../interfaces/Models/Idesignation";
import designation from "../models/DesignationModel";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";

@injectable()
export class DesignationRepository
  extends BaseRepository<IDesignation>
  implements IDesignationRepository
{
  constructor() {
    super(designation);
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all job designations");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<IDesignation> = {};

      if (options.search) {
        filter.$or = [
          { designation: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = "Active";
        } else if (options.status === "blocked") {
          filter.status = "Blocked";
        }
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page: page, limit: limit },
          sort: { createdAt: -1 },
        })) as { data: IDesignation[]; total: number };

        console.log("job designations with pagination:", result);
        return {
          data: result.data,
          total: result.total,
          page: page,
          limit: limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allDesignations = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as IDesignation[];

        console.log("all designations without pagination:", allDesignations);
        return {
          data: allDesignations,
          total: allDesignations.length,
          page: 1,
          limit: allDesignations.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("error occurred while fetching job designations:", error);
      throw new Error("Failed to fetch job designations");
    }
  }

  async findDesignationByName(name: string): Promise<IDesignation | null> {
    try {
      return await this.findOne({ designation: name });
    } catch (error) {
      throw new Error("Failed to find designation by name: " + error);
    }
  }

  async findDesignationById(id: string): Promise<IDesignation | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      throw new Error("Error finding designation by ID: " + error);
    }
  }

  async addDesignation(designation: string): Promise<IDesignation> {
    try {
      const newDesignation = await this.create({ designation });
      console.log(
        "new Designation in the addDesignation repository:",
        newDesignation
      );
      return await newDesignation.save();
    } catch (error) {
      throw new Error("Failed to add designation: " + error);
    }
  }

  async blockDesignation(
    id: string,
    newStatus: "Active" | "Blocked"
  ): Promise<IDesignation | null> {
    try {
      const updatedDesignation = await this.updateOne(
        { _id: id },
        { status: newStatus }
      );

      if (!updatedDesignation) {
        console.log(`Designation with ID ${id} not found`);
        throw new Error("Designation not found");
      }

      console.log(
        "blocking the designation in the jobdesignation repository:",
        updatedDesignation
      );

      return updatedDesignation;
    } catch (error) {
      throw new Error("Failed to block designation: " + error);
    }
  }
}

import { FilterQuery } from "mongoose";
import { IJobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";
import { IJobDesignation } from "../interfaces/Models/IjobDesignation";
import jobDesignation from "../models/jobDesignationModel";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";

@injectable()
export class JobDesignationRepository
  extends BaseRepository<IJobDesignation>
  implements IJobDesignationRepository
{
  constructor() {
    super(jobDesignation);
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?:string;
  }): Promise<{
    data: IJobDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all job designations");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<IJobDesignation> = {};

      if (options.search) {
        filter.$or = [
          { designation: { $regex: options.search, $options: "i" } },
        ];
      }

      if(options.status){
        if(options.status === "active"){
          filter.status = true;
        }else if(options.status === "blocked"){
          filter.status = false
        }
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page: page, limit: limit },
          sort: { createdAt: -1 },
        })) as { data: IJobDesignation[]; total: number };

        console.log("job designations with pagination:", result);
        return {
          data: result.data,
          total: result.total,
          page: page,
          limit: limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allDesignations = await this.model
          .find(filter)
          .sort({ createdAt: -1 });

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

  async findByName(name: string): Promise<IJobDesignation | null> {
    try {
      return await jobDesignation.findOne({ designation: name });
    } catch (error) {
      throw new Error("Failed to find designation by name: " + error);
    }
  }

  async findById(id: string): Promise<IJobDesignation | null> {
    try {
      return await jobDesignation.findById(id).exec();
    } catch (error) {
      throw new Error("Error finding designation by ID: " + error);
    }
  }

  async addDesignation(designation: string): Promise<IJobDesignation> {
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
    status: boolean
  ): Promise<IJobDesignation | null> {
    try {
      const updatedDesignation = await this.updateOne(
        { _id: id },
        { status: status }
      );

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

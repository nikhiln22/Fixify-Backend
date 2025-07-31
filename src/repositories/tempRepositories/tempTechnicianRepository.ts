import { ITempTechnicianRepository } from "../../interfaces/Irepositories/ItempTechnicianRepository";
import { ITempTechnician } from "../../interfaces/Models/ItempTechnician";
import mongoose from "mongoose";
import tempTechnician from "../../models/tempTechnicianModel";
import { BaseRepository } from "../baseRepository";
import {
  CreateTempTechnicianResponse,
  FindTempTechnicianByEmail,
  FindTempTechnicianById,
} from "../../interfaces/DTO/IRepository/ItechnicianRepository";
import { injectable } from "tsyringe";

@injectable()
export class TempTechnicianRepository
  extends BaseRepository<ITempTechnician>
  implements ITempTechnicianRepository
{
  constructor() {
    super(tempTechnician);
  }

  async createTempTechnician(
    technicianData: ITempTechnician
  ): Promise<CreateTempTechnicianResponse> {
    try {
      console.log("entering into the temporary technician creating function");
      const temporaryTechnician = await this.create(technicianData);
      console.log("temporaryTechnician:", temporaryTechnician);
      const savedTemporaryTechnician = await temporaryTechnician.save();
      console.log(
        "savedTemporaryUser from userRepository:",
        savedTemporaryTechnician
      );
      const tempTechnicianId = (
        savedTemporaryTechnician._id as mongoose.Types.ObjectId
      ).toString();

      const email = savedTemporaryTechnician.email;

      console.log(
        "email from the temp technician createTempTechnician repository:",
        email
      );

      if (!savedTemporaryTechnician) {
        throw new Error("cannot be saved");
      }
      return { success: true, tempTechnicianId, email };
    } catch (error) {
      console.log(error);
      throw new Error("Error occured while creating new technician");
    }
  }

  async findTempTechnicianById(
    tempTechnicianId: string
  ): Promise<FindTempTechnicianById> {
    try {
      const tempSavedTechnician = await this.findById(tempTechnicianId);
      console.log("tempSavedTechnician:", tempSavedTechnician);
      if (tempSavedTechnician) {
        return { success: true, tempTechnicianData: tempSavedTechnician };
      } else {
        return {
          success: false,
          message: "Temporary technician not found or expired",
        };
      }
    } catch (error) {
      console.log("Error fetching temporary technician:", error);
      throw new Error(
        "An error occurred while retrieving the temporary technician"
      );
    }
  }

  async findTempTechnicianByEmail(
    email: string
  ): Promise<FindTempTechnicianByEmail> {
    try {
      const tempSavedTechnician = await this.findOne({
        email,
        expiresAt: { $gt: new Date() },
      });
      console.log("tempSavedTechnician by Email:", tempSavedTechnician);
      if (tempSavedTechnician) {
        return { success: true, tempTechnicianData: tempSavedTechnician };
      } else {
        return {
          success: false,
          message: "Temporary technician not found or expired",
        };
      }
    } catch (error) {
      console.log("error fetching temporary by email:", error);
      throw new Error("An error occured while retreiving the temporary user");
    }
  }
}

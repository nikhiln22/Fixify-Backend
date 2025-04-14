import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../../interfaces/Iservices/IjobDesignationService";
import { AddDesignationResponseDTO } from "../../interfaces/DTO/IServices/jobDesignationService.dto";
import { IjobDesignationController } from "../../interfaces/Icontrollers/IjobDesignationController";

@injectable()
export class JobDesignationController implements IjobDesignationController {
  constructor(
    @inject("IjobDesignationService")
    private jobDesignationService: IjobDesignationService
  ) {}

  async addDesignation(req: Request, res: Response): Promise<void> {
    const { designation } = req.body;

    const result: AddDesignationResponseDTO =
      await this.jobDesignationService.addDesignation(designation);

    res.status(result.status).json({
      message: result.message,
      designation: result.designation || null,
    });
  }

  async blockDesignation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result: AddDesignationResponseDTO =
      await this.jobDesignationService.blockDesignation(id);

    res.status(result.status).json({
      message: result.message,
    });
  }

  async getAllDesignations(req: Request, res: Response): Promise<void> {
    const result: AddDesignationResponseDTO =
      await this.jobDesignationService.getAllDesignations();

    res.status(result.status).json({
      message: result.message,
      designations: result.designation || [],
    });
  }

  async findDesignationByName(req: Request, res: Response): Promise<void> {
    const { name } = req.params;

    const result: AddDesignationResponseDTO =
      await this.jobDesignationService.findDesignationByName(name);

    res.status(result.status).json({
      message: result.message,
      designation: result.designation || null,
    });
  }
}

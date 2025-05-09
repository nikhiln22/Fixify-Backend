import { ItechnicianController } from "../../interfaces/Icontrollers/Itechniciancontrollers/ItechnicianController";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { ItechnicianService } from "../../interfaces/Iservices/ItechnicianService/ItechnicianService";

@injectable()
export class TechnicianController implements ItechnicianController {
  constructor(
    @inject("ItechnicianService") private technicianService: ItechnicianService
  ) {}

  async getJobDesignations(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the job designations fetching function from the technician controller"
      );

      let response = await this.technicianService.getJobDesignations();
      console.log(
        "respone from the job job designations controller:",
        response
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("error occured:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error occured" });
    }
  }


  async submitQualifications(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering technician qualification submission");
      const data = req.body;
      console.log("Received data:", data);

      const technicianId = (req as any).user?.id;

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const qualificationData = {
        experience: req.body.experience,
        designation: req.body.designation,
        about: req.body.about,
        profilePhoto: files?.profilePhoto?.[0],
        certificates: files?.certificates,
      };

      console.log("Processing qualification data:", qualificationData);

      const response =
        await this.technicianService.submitTechnicianQualifications(
          technicianId,
          qualificationData
        );

      res.status(response.status).json(response)
    } catch (error) {
      console.log("Some error occurred:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering technician profile fetch");
      const technicianId = (req as any).user?.id;
      
      if (!technicianId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Unauthorized access",
          success: false,
          status: HTTP_STATUS.UNAUTHORIZED
        });
        return;
      }
      
      const response = await this.technicianService.getTechnicianProfile(technicianId);
      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      });
    }
  }
}
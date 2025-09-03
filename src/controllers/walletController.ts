import { inject, injectable } from "tsyringe";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { IWalletService } from "../interfaces/Iservices/IwalletService";
import { Response } from "express";
import { Roles } from "../config/roles";

@injectable()
export class WalletController {
  constructor(
    @inject("IWalletService") private _walletService: IWalletService
  ) {}

  async addMoney(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the function which adds the money to the user wallet"
      );
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      const { amount } = req.body;
      console.log("userId in the add money controller:", userId);
      console.log("Received Data:", amount);

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._walletService.addMoney(
        userId,
        amount,
        role
      );
      console.log(
        "result in the usercontroller for adding money in wallet:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to add money to wallet"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred in the user controller while adding the money to wallet:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyWalletStripeSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entering to the verifyStripeSession in the user controller function for wallet"
      );

      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      const sessionId = req.params.sessionId as string;
      console.log("userId in the verify stripe session for wallet:", userId);
      console.log(
        "sessionId in the verify stripe session for wallet:",
        sessionId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse =
        await this._walletService.verifyWalletStripeSession(
          sessionId,
          userId,
          role
        );

      console.log(
        "result from the verifying stripe session in user controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("not completed")
          ? HTTP_STATUS.NOT_COMPLETED
          : serviceResponse.message?.includes("not belong")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify wallet payment"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while verifying the stripe session:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getWalletBalance(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the wallet balance for the user in the user controller function"
      );
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      console.log(
        "userId in the getWalletBalance function in user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse = await this._walletService.getWalletBalance(
        userId,
        role
      );
      console.log(
        "response in the user controller for fetching the user wallet balance:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch wallet balance"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the user wallet balance:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getWalletTransactions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("fetching the wallet transactions:");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      console.log(
        "userId in the getwallet transactions in the user controller:",
        userId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse =
        await this._walletService.getAllWalletTransactions({
          page,
          limit,
          userId,
          role,
        });

      console.log("response in the getWalletTransactions:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch wallet transactions"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching all the wallet transactions of the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}

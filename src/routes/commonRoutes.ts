import express, { Router } from "express";
import { RefreshController } from "../controllers/common/refreshController";
import { container } from "tsyringe";

export class CommonRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    const refreshController = container.resolve(RefreshController);

    this.router.post(
      "/refreshtoken",
      refreshController.refreshAccessToken.bind(refreshController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

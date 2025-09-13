import express, { Router } from "express";
import { container } from "../di/container";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";
import { ChatController } from "../controllers/chatController";

export class ChatRoutes {
  private router: Router;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = express.Router();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.setupRoutes();
  }

  private setupRoutes() {
    const chatController = container.resolve(ChatController);

    this.router.get(
      "/:bookingId/history",
      this.authMiddleware.authenticate(
        Roles.USER,
        Roles.TECHNICIAN
      ),
      chatController.getChatHistory.bind(chatController)
    );

    this.router.post(
      "/:bookingId/send",
      this.authMiddleware.authenticate(
        Roles.USER,
        Roles.TECHNICIAN
      ),
      chatController.sendChat.bind(chatController)
    );
  }

  public getRouter() {
    return this.router;
  }
}

import express, { Express } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import config from "./config/env";
import LoggerMiddleware from "./middlewares/LoggerMiddleware";
import { createServer, Server as HttpServer } from "http";
import { initializeSocket } from "./utils/socket";
import { Server as SocketIOServer } from "socket.io";
import { AuthenticatedRequest } from "./middlewares/AuthMiddleware";
import { RouteRegistry } from "./routes";

export class App {
  public app: Express;
  public server: HttpServer;
  public io!: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupMiddlewares();
    this.setupSocket();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(LoggerMiddleware.getMiddleware());

    this.app.use(
      cors({
        origin: (origin, callback) => {
          const allowedOrigins = [
            config.CLIENT_URL,
            "https://fixify.homes",
            "https://www.fixify.homes",
          ];
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
          "Authorization",
          "Content-Type",
          "Access-Control-Allow-Headers",
          "Origin",
          "Accept",
          "X-Requested-With",
          "Access-Control-Request-Method",
          "Access-Control-Request-Headers",
        ],
        exposedHeaders: ["Set-Cookie"],
        credentials: true,
      })
    );

    this.app.use(express.json());
    this.app.use(cookieparser());
  }

  private setupSocket(): void {
    this.io = initializeSocket(this.server);

    this.app.use((req: AuthenticatedRequest, res, next) => {
      req.io = this.io;
      next();
    });
  }

  private setupRoutes(): void {
    RouteRegistry.registerRoutes(this.app);
  }

  public getServer(): HttpServer {
    return this.server;
  }
}

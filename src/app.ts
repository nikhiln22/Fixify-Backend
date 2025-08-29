import express, { Express } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import config from "./config/env";
import { UserRoutes } from "./routes/userRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { TechnicianRoutes } from "./routes/technicianRoutes";
import { AuthRoutes } from "./routes/authRoutes";
import LoggerMiddleware from "./middlewares/LoggerMiddleware";
import { createServer, Server as HttpServer } from "http";
import { initializeSocket } from "./utils/socket";
import { Server as SocketIOServer } from "socket.io";
import { AuthenticatedRequest } from "./middlewares/AuthMiddleware";

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

    const corsOptions = {
      origin: [
        config.CLIENT_URL,
        "https://fixify.homes",
        "https://www.fixify.homes",
      ],
      methods: ["GET,POST,PUT,DELETE,PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
      optionsSuccessStatus: 200,
    };
    this.app.use(cors(corsOptions));

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
    const userRoutes = new UserRoutes();
    const adminRoutes = new AdminRoutes();
    const technicianRoutes = new TechnicianRoutes();
    const authRoutes = new AuthRoutes();

    this.app.use("/api/user", userRoutes.getRouter());
    this.app.use("/api/admin", adminRoutes.getRouter());
    this.app.use("/api/technician", technicianRoutes.getRouter());
    this.app.use("/api", authRoutes.getRouter());
  }

  public getServer(): HttpServer {
    return this.server;
  }
}

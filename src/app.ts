import express, { Express } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import config from "./config/env";
import { UserRoutes } from "./routes/userRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { TechnicianRoutes } from "./routes/technicianRoutes";
import { AuthRoutes } from "./routes/authRoutes";
import LoggerMiddleware from "./middlewares/LoggerMiddleware";
export class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(LoggerMiddleware.getMiddleware());

    const corsOptions = {
      origin: config.CLIENT_URL,
      methods: "GET,POST,PUT,DELETE,PATCH",
      credentials: true,
      allowedHeaders: "Content-Type,Authorization",
    };
    this.app.use(cors(corsOptions));

    this.app.use(express.json());

    this.app.use(cookieparser());
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

  public getServer(): Express {
    return this.app;
  }
}

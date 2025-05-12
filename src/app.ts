import express, { Express } from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import config from "./config/env";
import { UserRoutes } from "./routes/userRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { TechnicianRoutes } from "./routes/technicianRoutes";
import { CommonRoutes } from "./routes/commonRoutes";

export class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
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
    const commonRoutes = new CommonRoutes();

    this.app.use("/user", userRoutes.getRouter());
    this.app.use("/admin", adminRoutes.getRouter());
    this.app.use("/technician", technicianRoutes.getRouter());
    this.app.use("/", commonRoutes.getRouter());
  }

  public getServer(): Express {
    return this.app;
  }
}

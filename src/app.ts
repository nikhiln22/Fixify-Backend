import express, { Express } from "express";
import cors from "cors";
import config from "./config/env";
import { UserRoutes } from "./routes/userRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { TechnicianRoutes } from "./routes/technicianRoutes";

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
  }

  private setupRoutes(): void {
    const userRoutes = new UserRoutes();
    const adminRoutes = new AdminRoutes();
    const technicianRoutes = new TechnicianRoutes()

    this.app.use("/user", userRoutes.getRouter());
    this.app.use("/admin", adminRoutes.getRouter());
    this.app.use("/technician", technicianRoutes.getRouter());
  }

  public getServer(): Express {
    return this.app;
  }
}

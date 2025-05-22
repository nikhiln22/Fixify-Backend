import "reflect-metadata";
import { container } from "tsyringe";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { JWTService } from "../utils/jwt";
import { IauthService } from "../interfaces/Iservices/IauthService";
import { AuthService } from "../services/authService";

container.registerSingleton<IjwtService>("IjwtService", JWTService);
container.registerSingleton<IauthService>("IauthService", AuthService);

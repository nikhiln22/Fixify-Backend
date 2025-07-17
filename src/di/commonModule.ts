import "reflect-metadata";
import { container } from "tsyringe";
import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { JWTService } from "../utils/jwt";
import { IAuthService } from "../interfaces/Iservices/IauthService";
import { AuthService } from "../services/authService";

container.registerSingleton<IJwtService>("IJwtService", JWTService);
container.registerSingleton<IAuthService>("IAuthService", AuthService);

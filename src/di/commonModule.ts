import "reflect-metadata";
import { container } from "tsyringe";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { JWTService } from "../utils/jwt";
import { IrefreshService } from "../interfaces/Iservices/IcommonService/IrefreshService";
import { RefreshService } from "../services/commonService/refreshService";

container.registerSingleton<IjwtService>("IjwtService", JWTService);
container.registerSingleton<IrefreshService>("IrefreshService", RefreshService);

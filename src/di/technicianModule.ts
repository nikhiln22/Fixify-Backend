import "reflect-metadata";
import { container } from "tsyringe";

import { TechnicianAuthService } from "../services/technicianService/technicianAuthService";
import { TechnicianRepository } from "../repositories/technicianRepository";
import { TempTechnicianRepository } from "../repositories/tempRepositories/tempTechnicianRepository";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";
import { EmailService } from "../utils/email";
import { EmailTemplateService } from "../utils/emailTemplates";
import { OTPService } from "../utils/otp";
import { RedisService } from "../utils/redis";

import { ItechnicianAuthService } from "../interfaces/Iservices/ItechnicianAuthService";
import { ItechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ItempTechnicianRepository } from "../interfaces/Irepositories/ItempTechnicianRepository";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { IemailTemplateService } from "../interfaces/Iemail/IemailTemplate";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IredisService } from "../interfaces/Iredis/Iredis";

container.register<ItechnicianAuthService>("ItechnicianAuthService",{useClass:TechnicianAuthService});
container.register<ItechnicianRepository>("ItechnicianRepository",{useClass:TechnicianRepository});
container.register<ItempTechnicianRepository>("ItempTechnicianRepository",{useClass:TempTechnicianRepository});
container.register<IPasswordHasher>("IPasswordHasher",{useClass:PasswordHasher});
container.register<IjwtService>("IjwtService",{useClass:JWTService});
container.register<IOTPService>("IOTPService",{useClass:OTPService});
container.register<IredisService>("IredisService",{useClass:RedisService});
container.register<IemailService>("IemailService",{useClass:EmailService});
container.register<IemailTemplateService>("IemailTemplateService",{useClass:EmailTemplateService});
import "reflect-metadata";
import { container } from "tsyringe";

import { UserAuthService } from "../services/userService/userAuthService";
import { UserRepository } from "../repositories/userRepository";
import { TempUserRepository } from "../repositories/tempRepositories/tempUserRepository";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";
import { EmailService } from "../utils/email";
import { EmailTemplateService } from "../utils/emailTemplates";
import { OTPService } from "../utils/otp";
import { RedisService } from "../utils/redis";


import { IuserAuthService } from "../interfaces/Iservices/IuserAuthService";
import { IuserRepository } from "../interfaces/Irepositories/IuserRepository";
import { ItempUserRepository } from "../interfaces/Irepositories/ItempUserRepository";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { IemailTemplateService } from "../interfaces/Iemail/IemailTemplate";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IredisService } from "../interfaces/Iredis/Iredis";


container.register<IuserAuthService>("IuserAuthService", {
  useClass: UserAuthService,
});
container.register<IuserRepository>("IuserRepository", {
  useClass: UserRepository,
});
container.register<ItempUserRepository>("ItempUserRepository", {
  useClass: TempUserRepository,
});
container.register<IPasswordHasher>("IPasswordHasher", {
  useClass: PasswordHasher,
});
container.register<IjwtService>("IjwtService", { useClass: JWTService });
container.register<IOTPService>("IOTPService", { useClass: OTPService });
container.register<IredisService>("IredisService", { useClass: RedisService });
container.register<IemailService>("IemailService", { useClass: EmailService });
container.register<IemailTemplateService>("IemailTemplateService", {
  useClass: EmailTemplateService,
});

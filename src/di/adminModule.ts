import "reflect-metadata";
import { container } from "tsyringe";

import { AdminAuthService } from "../services/adminAuthService";
import { AdminRepository } from "../repositories/adminRepository/adminRepository";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";

import { IadminRepository } from "../interfaces/Irepositories/IadminRepository";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IadminService } from "../interfaces/Iservices/IadminService";


container.register<IadminService>("IadminService", {
  useClass: AdminAuthService,
});

container.register<IadminRepository>("IadminRepository", {
  useClass: AdminRepository,
});

container.register<IPasswordHasher>("IPasswordHasher", {
  useClass: PasswordHasher,
});

container.register<IjwtService>("IjwtService", { useClass: JWTService });

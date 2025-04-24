import "reflect-metadata";
import { container } from "tsyringe";

import { AdminAuthService } from "../services/adminService/adminAuthService";
import { AdminRepository } from "../repositories/adminRepository";
import { JobDesignationRepository } from "../repositories/jobDesignationRepository";
import { JobDesignationService } from "../services/adminService/jobDesignationService";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";

import { IadminRepository } from "../interfaces/Irepositories/IadminRepository";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IadminService } from "../interfaces/Iservices/IadminService/IadminAuthService";
import { IjobDesignationService } from "../interfaces/Iservices/IadminService/IjobDesignationService";
import { IjobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";


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

container.register<IjobDesignationService>("IjobDesignationService", {
  useClass: JobDesignationService,
});

container.register<IjobDesignationRepository>("IjobDesignationRepository", {
  useClass: JobDesignationRepository,
});

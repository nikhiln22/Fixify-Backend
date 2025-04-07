import express from "express";
import { UserController } from "../controllers/user/userController";
import { UserService } from "../services/userService";
import { UserRepository } from "../repositories/userRepository/userRepository";
import { EmailService } from "../utils/email";
import { OTPService } from "../utils/otp";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";
import { TempUserRepository } from "../repositories/tempRepositories/tempUserRepository";

const userRoute = express.Router();

const userRepository = new UserRepository();
const tempUserRepository = new TempUserRepository();
const emailService = new EmailService();
const otpService = new OTPService();
const passwordService = new PasswordHasher();
const jwtService = new JWTService();
const userService = new UserService(
  userRepository,
  tempUserRepository,
  emailService,
  otpService,
  passwordService,
  jwtService
);

const userController = new UserController(userService);

userRoute.post("/login", userController.login.bind(userController));
userRoute.post("/register", userController.register.bind(userController));
userRoute.post("/verifyOtp", userController.verifyOtp.bind(userController));
userRoute.post("/resendotp", userController.resendOtp.bind(userController));


export default userRoute;

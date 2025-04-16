import express from "express";
import { UserController } from "../controllers/user/userController";
import { UserAuthService } from "../services/userService/userAuthService";
import { UserRepository } from "../repositories/userRepository";
import { EmailTemplateService } from "../utils/emailTemplates";
import { EmailService } from "../utils/email";
import { OTPService } from "../utils/otp";
import { PasswordHasher } from "../utils/password";
import { JWTService } from "../utils/jwt";
import { RedisService } from "../utils/redis";
import { TempUserRepository } from "../repositories/tempRepositories/tempUserRepository";

const userRoute = express.Router();

const userRepository = new UserRepository();
const tempUserRepository = new TempUserRepository();
const emailTemplateService = new EmailTemplateService();
const emailService = new EmailService(emailTemplateService);
const otpService = new OTPService();
const passwordService = new PasswordHasher();
const jwtService = new JWTService();
const redisService = new RedisService();
const userService = new UserAuthService(
  userRepository,
  tempUserRepository,
  emailService,
  otpService,
  passwordService,
  jwtService,
  redisService
);

const userController = new UserController(userService);

userRoute.post("/login", userController.login.bind(userController));
userRoute.post("/register", userController.register.bind(userController));
userRoute.post("/verifyOtp", userController.verifyOtp.bind(userController));
userRoute.post("/resendotp", userController.resendOtp.bind(userController));
userRoute.post("/forgotpassword",userController.forgotPassword.bind(userController));
userRoute.post("/resetpassword",userController.resetPassword.bind(userController));


export default userRoute;
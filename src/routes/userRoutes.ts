import express from 'express';
import { UserController } from '../controllers/user/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository/userRepository';
import { EmailService } from '../utils/email';
import { OTPService } from '../utils/otp';
import { PasswordHasher } from '../utils/password'


const userRoute = express.Router();

const userRepository = new UserRepository()
const emailService = new EmailService();
const otpService = new OTPService();
const passwordService = new PasswordHasher()
const userService = new UserService(userRepository, emailService, otpService, passwordService);

const userController = new UserController(userService);


userRoute.post('/register', userController.register.bind(userController));
userRoute.post('/verifyOtp', userController.verifyOtp.bind(userController));

export default userRoute;
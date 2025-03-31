import nodemailer, { Transporter } from 'nodemailer'
import config from '../config/env'
import { IemailService } from '../interfaces/Iemail/Iemail'

export class EmailService implements IemailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        })
    }

    async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
        const mailOptions = {
            from: config.EMAIL_USER,
            to: toEmail,
            subject: 'Your OTP Code',
            text: `Your OTP code is: ${otp}`,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
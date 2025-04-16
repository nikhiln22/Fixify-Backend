import nodemailer, { Transporter } from "nodemailer";
import config from "../config/env";
import { EmailType, APP_NAME } from "../config/emailConfig";
import { OtpPurpose, OTP_EXPIRY_SECONDS } from "../config/otpConfig";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { IemailTemplateService } from "../interfaces/Iemail/IemailTemplate";
import { EmailTemplate } from "../types/email.types";
import { inject, injectable } from "tsyringe";

@injectable()
export class EmailService implements IemailService {
  private transporter: Transporter;
  private appName: string = APP_NAME;

  constructor(
    @inject("IemailTemplateService")
    private emailTemplateService: IemailTemplateService
  ) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
    const expiryTimeInMinutes = Math.ceil(OTP_EXPIRY_SECONDS / 60);
    await this.sendEmail({
      to: toEmail,
      subject: `Verify Your ${this.appName} Account`,
      type: EmailType.SIGNUP_OTP,
      data: {
        otp,
        expiryTime: `${expiryTimeInMinutes} minute${
          expiryTimeInMinutes > 1 ? "s" : ""
        }`,
        purpose: OtpPurpose.REGISTRATION,
      },
    });
    console.log(`Signup OTP email sent to ${toEmail}`);
  }

  async sendPasswordResetEmail(toEmail: string, otp: string): Promise<void> {
    const expiryTimeInMinutes = Math.ceil(OTP_EXPIRY_SECONDS / 60);
    await this.sendEmail({
      to: toEmail,
      subject: `Reset Your ${this.appName} Password`,
      type: EmailType.PASSWORD_RESET,
      data: {
        otp,
        expiryTime: `${expiryTimeInMinutes} minute${
          expiryTimeInMinutes > 1 ? "s" : ""
        }`,
        purpose: OtpPurpose.PASSWORD_RESET,
      },
    });
    console.log(`Password reset OTP email sent to ${toEmail}`);
  }

  private async sendEmail(options: EmailTemplate): Promise<void> {
    const { to, subject, type, data } = options;

    const emailContent = this.emailTemplateService.generateEmailContent(
      type,
      data
    );

    const mailOptions = {
      from: `"${this.appName} Team" <${config.EMAIL_USER}>`,
      to,
      subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

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

    const emailContent = this.emailTemplateService.generateEmailContent(
      EmailType.SIGNUP_OTP,
      {
        otp,
        expiryTime: `${expiryTimeInMinutes} minute${
          expiryTimeInMinutes > 1 ? "s" : ""
        }`,
        purpose: OtpPurpose.REGISTRATION,
      }
    );

    await this.sendEmail({
      to: toEmail,
      subject: `Verify Your ${this.appName} Account`,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Signup OTP email sent to ${toEmail}`);
  }

  async sendPasswordResetEmail(toEmail: string, otp: string): Promise<void> {
    const expiryTimeInMinutes = Math.ceil(OTP_EXPIRY_SECONDS / 60);

    const emailContent = this.emailTemplateService.generateEmailContent(
      EmailType.PASSWORD_RESET_OTP,
      {
        otp,
        expiryTime: `${expiryTimeInMinutes} minute${
          expiryTimeInMinutes > 1 ? "s" : ""
        }`,
        purpose: OtpPurpose.PASSWORD_RESET,
      }
    );

    // Then send with the expected format
    await this.sendEmail({
      to: toEmail,
      subject: `Reset Your ${this.appName} Password`,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Password reset OTP email sent to ${toEmail}`);
  }

  async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const { to, subject, html, text } = emailData;

    const mailOptions = {
      from: `"${this.appName} Team" <${config.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  generateEmailContent(
    type: EmailType,
    data: any
  ): { html: string; text: string } {
    return this.emailTemplateService.generateEmailContent(type, data);
  }
}

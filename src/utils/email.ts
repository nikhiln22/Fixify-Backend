import nodemailer, { Transporter } from "nodemailer";
import config from "../config/env";
import { EmailType, APP_NAME } from "../config/emailConfig";
import { OTP_EXPIRY_SECONDS } from "../config/otpConfig";
import { IEmailService } from "../interfaces/Iemail/Iemail";
import { IemailTemplateService } from "../interfaces/Iemail/IemailTemplate";
import { inject, injectable } from "tsyringe";
import { BookingCompletionData } from "./emailTemplates";

@injectable()
export class EmailService implements IEmailService {
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

  private formatExpiryTime(): string {
    const minutes = Math.ceil(OTP_EXPIRY_SECONDS / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  async sendOtpEmail(toEmail: string, otp: string): Promise<void> {
    try {
      const emailContent = this.emailTemplateService.generateEmailContent(
        EmailType.SIGNUP_OTP,
        {
          otp,
          expiryTime: this.formatExpiryTime(),
        }
      );

      await this.sendEmail({
        to: toEmail,
        subject: `Verify Your ${this.appName} Account`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Signup OTP email sent to ${toEmail}`);
    } catch (error) {
      console.error(`Failed to send OTP email to ${toEmail}:`, error);
      throw new Error(`Failed to send OTP email: ${error}`);
    }
  }

  async sendPasswordResetEmail(toEmail: string, otp: string): Promise<void> {
    try {
      const emailContent = this.emailTemplateService.generateEmailContent(
        EmailType.PASSWORD_RESET_OTP,
        {
          otp,
          expiryTime: this.formatExpiryTime(),
        }
      );

      await this.sendEmail({
        to: toEmail,
        subject: `Reset Your ${this.appName} Password`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Password reset OTP email sent to ${toEmail}`);
    } catch (error) {
      console.error(
        `Failed to send password reset email to ${toEmail}:`,
        error
      );
      throw new Error(`Failed to send password reset email: ${error}`);
    }
  }

  async sendTechnicianApprovalEmail(
    toEmail: string,
    technicianName: string
  ): Promise<void> {
    try {
      const emailContent = this.emailTemplateService.generateEmailContent(
        EmailType.VERIFICATION_SUCCESS,
        { technicianName }
      );

      await this.sendEmail({
        to: toEmail,
        subject: `Application Approved - Welcome to ${this.appName}!`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Technician approval email sent to ${toEmail}`);
    } catch (error) {
      console.error(`Failed to send approval email to ${toEmail}:`, error);
      throw new Error(`Failed to send approval email: ${error}`);
    }
  }

  async sendTechnicianRejectionEmail(
    toEmail: string,
    technicianName: string,
    reason?: string
  ): Promise<void> {
    try {
      const emailContent = this.emailTemplateService.generateEmailContent(
        EmailType.APPLICATION_REJECTED,
        { technicianName, reason }
      );

      await this.sendEmail({
        to: toEmail,
        subject: `Application Update - ${this.appName}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Technician rejection email sent to ${toEmail}`);
    } catch (error) {
      console.error(`Failed to send rejection email to ${toEmail}:`, error);
      throw new Error(`Failed to send rejection email: ${error}`);
    }
  }

  async sendBookingCompletionEmail(
    toEmail: string,
    bookingData: BookingCompletionData
  ): Promise<void> {
    try {
      const emailContent = this.emailTemplateService.generateEmailContent(
        EmailType.BOOKING_COMPLETION_OTP,
        bookingData
      );

      await this.sendEmail({
        to: toEmail,
        subject: `Service Completed - ${this.appName}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`Booking completion email sent to ${toEmail}`);
    } catch (error) {
      console.error(
        `Failed to send booking completion email to ${toEmail}:`,
        error
      );
      throw new Error(`Failed to send booking completion email: ${error}`);
    }
  }

  async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    try {
      const { to, subject, html, text } = emailData;

      const mailOptions = {
        from: `"${this.appName} Team" <${config.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `Email sent successfully to ${to}. MessageId: ${result.messageId}`
      );
    } catch (error) {
      console.error(`Failed to send email to ${emailData.to}:`, error);
      throw new Error(`Email delivery failed: ${error}`);
    }
  }
}

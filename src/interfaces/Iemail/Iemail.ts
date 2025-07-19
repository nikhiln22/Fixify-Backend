import { EmailType } from "../../config/emailConfig";
// import { EmailTemplate } from "../../types/email.types";
// import { EmailContentResult } from "./IemailTemplate";

export interface IEmailService {
  sendOtpEmail(toEmail: string, otp: string): Promise<void>;
  sendPasswordResetEmail(toEmail: string, otp: string): Promise<void>;
  sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void>;
  generateEmailContent(
    type: EmailType,
    data: any
  ): { html: string; text: string };
}

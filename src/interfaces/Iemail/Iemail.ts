import { BookingCompletionData } from "../../utils/emailTemplates";

export interface IEmailService {
  sendOtpEmail(toEmail: string, otp: string): Promise<void>;
  sendPasswordResetEmail(toEmail: string, otp: string): Promise<void>;
  sendTechnicianApprovalEmail(
    toEmail: string,
    technicianName: string
  ): Promise<void>;
  sendTechnicianRejectionEmail(
    toEmail: string,
    technicianName: string,
    reason?: string
  ): Promise<void>;
  sendBookingCompletionEmail(
    toEmail: string,
    bookingData: BookingCompletionData
  ): Promise<void>;
  sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void>;
}

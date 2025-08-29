import { injectable } from "tsyringe";
import { EmailType, APP_NAME } from "../config/emailConfig";
import { IemailTemplateService } from "../interfaces/Iemail/IemailTemplate";

export interface EmailContentResult {
  html: string;
  text: string;
}

export interface OtpEmailData {
  otp: string;
  expiryTime: string;
}

export interface TechnicianApprovalData {
  technicianName: string;
}

export interface TechnicianRejectionData {
  technicianName: string;
  reason?: string;
}

export interface BookingCompletionData {
  customerName: string;
  serviceName: string;
  technicianName: string;
  otp: string;
  bookingId: string;
}

export type EmailData =
  | OtpEmailData
  | TechnicianApprovalData
  | TechnicianRejectionData
  | BookingCompletionData;

@injectable()
export class EmailTemplateService implements IemailTemplateService {
  private appName: string = APP_NAME;

  generateEmailContent(type: EmailType, data: EmailData): EmailContentResult {
    try {
      const templates = this.getEmailTemplates();
      const template = templates[type as keyof typeof templates];

      if (!template) {
        throw new Error(`Email template not found for type: ${type}`);
      }

      return {
        html: this.buildHtmlEmail(
          template.subject,
          template.getHtmlContent(data)
        ),
        text: template.getTextContent(data),
      };
    } catch (error) {
      throw new Error(`Failed to generate ${type} email, ${error}`);
    }
  }

  private buildHtmlEmail(subject: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .otp { font-size: 32px; font-weight: bold; text-align: center; 
                 background: #f5f5f5; padding: 20px; margin: 20px 0; }
          .footer { margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${this.appName}</h1>
          </div>
          ${content}
          <div class="footer">
            <p>Best regards,<br>The ${this.appName} Team</p>
            <p>&copy; ${new Date().getFullYear()} ${this.appName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getEmailTemplates() {
    return {
      [EmailType.SIGNUP_OTP]: {
        subject: "Verify Your Account",
        getHtmlContent: (data: EmailData) => {
          const otpData = data as OtpEmailData;
          return `
          <p>Please use this code to verify your account:</p>
          <div class="otp">${otpData.otp}</div>
          <p>This code expires in ${otpData.expiryTime}.</p>
        `;
        },
        getTextContent: (data: EmailData) => {
          const otpData = data as OtpEmailData;
          return `
          Verify Your Account
          
          Please use this code to verify your account: ${otpData.otp}
          This code expires in ${otpData.expiryTime}.
          
          Best regards,
          The ${this.appName} Team
        `;
        },
      },

      [EmailType.PASSWORD_RESET_OTP]: {
        subject: "Reset Your Password",
        getHtmlContent: (data: EmailData) => {
          const otpData = data as OtpEmailData;
          return `
          <p>Use this code to reset your password:</p>
          <div class="otp">${otpData.otp}</div>
          <p>This code expires in ${otpData.expiryTime}.</p>
        `;
        },
        getTextContent: (data: EmailData) => {
          const otpData = data as OtpEmailData;
          return `
          Reset Your Password
          
          Use this code to reset your password: ${otpData.otp}
          This code expires in ${otpData.expiryTime}.
          
          Best regards,
          The ${this.appName} Team
        `;
        },
      },

      [EmailType.VERIFICATION_SUCCESS]: {
        subject: "Application Approved!",
        getHtmlContent: (data: EmailData) => {
          const approvalData = data as TechnicianApprovalData;
          return `
          <p>Dear ${approvalData.technicianName},</p>
          <p><strong>Congratulations!</strong> Your technician application has been approved.</p>
          <p>You can now access your dashboard and start receiving service requests.</p>
        `;
        },
        getTextContent: (data: EmailData) => {
          const approvalData = data as TechnicianApprovalData;
          return `
          Application Approved!
          
          Dear ${approvalData.technicianName},
          
          Congratulations! Your technician application has been approved.
          You can now access your dashboard and start receiving service requests.
          
          Best regards,
          The ${this.appName} Team
        `;
        },
      },

      [EmailType.APPLICATION_REJECTED]: {
        subject: "Application Update",
        getHtmlContent: (data: EmailData) => {
          const rejectionData = data as TechnicianRejectionData;
          return `
      <p>Dear ${rejectionData.technicianName},</p>
      <p>Thank you for your interest in joining Fixify as a technician.</p>
      <p>Unfortunately, we cannot approve your application at this time.</p>
      ${
        rejectionData.reason
          ? `<p><strong>Reason:</strong> ${rejectionData.reason}</p>`
          : ""
      }
      <p>You're welcome to reapply in the future when you meet our requirements.</p>
    `;
        },
        getTextContent: (data: EmailData) => {
          const rejectionData = data as TechnicianRejectionData;
          return `
      Application Update
      
      Dear ${rejectionData.technicianName},
      
      Thank you for your interest in joining Fixify as a technician.
      Unfortunately, we cannot approve your application at this time.
      ${rejectionData.reason ? `\nReason: ${rejectionData.reason}` : ""}
      
      You're welcome to reapply in the future when you meet our requirements.
      
      Best regards,
      The ${this.appName} Team
    `;
        },
      },

      [EmailType.BOOKING_COMPLETION_OTP]: {
        subject: "Service Completion - Verify with OTP",
        getHtmlContent: (data: EmailData) => {
          const bookingData = data as BookingCompletionData;
          return `
      <p>Dear ${bookingData.customerName},</p>
      <p>Your <strong>${bookingData.serviceName}</strong> service has been completed by ${bookingData.technicianName}.</p>
      <p>Please use this OTP to confirm service completion:</p>
      <div class="otp">${bookingData.otp}</div>
      <p><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
    `;
        },
        getTextContent: (data: EmailData) => {
          const bookingData = data as BookingCompletionData;
          return `
      Service Completion - Verify with OTP
      
      Dear ${bookingData.customerName},
      
      Your ${bookingData.serviceName} service has been completed by ${bookingData.technicianName}.
      Please use this OTP to confirm service completion: ${bookingData.otp}
      
      Booking ID: ${bookingData.bookingId}
      
      Best regards,
      The ${this.appName} Team
    `;
        },
      },
    };
  }
}

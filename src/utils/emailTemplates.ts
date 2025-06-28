import { injectable } from "tsyringe";
import { EmailType, APP_NAME } from "../config/emailConfig";

export interface EmailContentResult {
  html: string;
  text: string;
}

@injectable()
export class EmailTemplateService {
  private appName: string = APP_NAME;

  generateEmailContent(type: EmailType, data: any): EmailContentResult {
    return {
      html: this.getHtmlContent(type, data),
      text: this.getTextContent(type, data),
    };
  }

  private getHtmlContent(type: EmailType, data: any): string {
    const year = new Date().getFullYear();

    const styles = {
      container:
        "max-width:600px; margin:0 auto; padding:20px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);",
      header:
        "text-align:center; padding:20px 0; border-bottom:1px solid #eeeeee;",
      title: "color:#333333; font-size:24px; margin:0;",
      content: "padding:30px 20px; color:#555555;",
      footer:
        "text-align:center; padding-top:20px; color:#999999; font-size:14px;",
      successBox:
        "background-color:#f0f9ff; border:1px solid #22c55e; border-radius:6px; padding:20px; margin:20px 0; text-align:center;",
      rejectBox:
        "background-color:#fef2f2; border:1px solid #ef4444; border-radius:6px; padding:20px; margin:20px 0; text-align:center;",
    };

    if (type === EmailType.VERIFICATION_SUCCESS) {
      const { technicianName } = data;
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Approved - ${this.appName}</title>
        </head>
        <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background-color:#f9f9f9;">
          <div style="${styles.container}">
            <div style="${styles.header}">
              <h1 style="${styles.title}">🎉 Application Approved!</h1>
            </div>
            <div style="${styles.content}">
              <p>Dear ${technicianName || "Technician"},</p>
              
              <div style="${styles.successBox}">
                <h2 style="color:#22c55e; margin:0 0 15px 0;">Congratulations!</h2>
                <p style="font-size:16px; margin:0;">Your technician application has been successfully approved by our team.</p>
              </div>
              
              <p>You can now:</p>
              <ul style="color:#555555; line-height:1.6;">
                <li>Access your full technician dashboard</li>
                <li>Start receiving service requests</li>
                <li>Update your profile and services</li>
                <li>Begin earning with ${this.appName}</li>
              </ul>
              
              <p>Thank you for joining our community of skilled technicians. We're excited to have you on board!</p>
              
              <div style="text-align:center; margin:30px 0;">
                <a href="#" style="background-color:#0066cc; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block;">Access Dashboard</a>
              </div>
              
              <p>Best Regards,<br>The ${this.appName} Team</p>
            </div>
            <div style="${styles.footer}">
              <p>&copy; ${year} ${this.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (type === EmailType.APPLICATION_REJECTED) {
      const { technicianName, reason } = data;
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Update - ${this.appName}</title>
        </head>
        <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background-color:#f9f9f9;">
          <div style="${styles.container}">
            <div style="${styles.header}">
              <h1 style="${styles.title}">Application Update</h1>
            </div>
            <div style="${styles.content}">
              <p>Dear ${technicianName || "Applicant"},</p>
              
              <div style="${styles.rejectBox}">
                <h2 style="color:#ef4444; margin:0 0 15px 0;">Application Status</h2>
                <p style="font-size:16px; margin:0;">We regret to inform you that your technician application has not been approved at this time.</p>
              </div>
              
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
              
              <p>We encourage you to:</p>
              <ul style="color:#555555; line-height:1.6;">
                <li>Review your application details</li>
                <li>Ensure all required documents are properly submitted</li>
                <li>Consider reapplying after addressing any issues</li>
                <li>Contact our support team if you have questions</li>
              </ul>
              
              <p>Thank you for your interest in joining ${
                this.appName
              }. We appreciate the time you took to apply.</p>
              
              <p>Best Regards,<br>The ${this.appName} Team</p>
            </div>
            <div style="${styles.footer}">
              <p>&copy; ${year} ${this.appName}. All rights reserved.</p>
              <p>If you have questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    if (type === EmailType.BOOKING_COMPLETION_OTP) {
      const { customerName, serviceName, technicianName, otp, bookingId } =
        data;
      return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Completion Verification - ${this.appName}</title>
    </head>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background-color:#f9f9f9;">
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.title}">🔧 Service Completion Verification</h1>
        </div>
        <div style="${styles.content}">
          <p>Dear ${customerName || "Customer"},</p>
          
          <p>Your ${
            this.appName
          } service is being completed! Our technician <strong>${
        technicianName || "Our technician"
      }</strong> has finished working on your <strong>${
        serviceName || "service request"
      }</strong>.</p>
          
          <div style="background-color:#f0f9ff; border:1px solid #3b82f6; border-radius:6px; padding:20px; margin:20px 0; text-align:center;">
            <h2 style="color:#1d4ed8; margin:0 0 15px 0;">Verification Code</h2>
            <p style="font-size:16px; margin:0 0 15px 0;">Please share this code with your technician to confirm service completion:</p>
            <div style="font-size:36px; font-weight:bold; color:#1d4ed8; letter-spacing:8px; background-color:#ffffff; padding:15px; border-radius:6px; margin:10px 0;">${otp}</div>
            <p style="font-size:14px; color:#6b7280; margin:10px 0 0 0;">Booking ID: #${
              bookingId ? bookingId.slice(-8).toUpperCase() : "N/A"
            }</p>
          </div>
          
          <div style="background-color:#fef3c7; border:1px solid #f59e0b; border-radius:6px; padding:15px; margin:20px 0;">
            <p style="margin:0; font-size:14px; color:#92400e;">
              <strong>📱 What to do:</strong> When your technician asks for the verification code, simply tell them the 6-digit number above.
            </p>
          </div>
          
          <p>This verification process ensures:</p>
          <ul style="color:#555555; line-height:1.6;">
            <li>Service has been completed to your satisfaction</li>
            <li>Secure confirmation between you and the technician</li>
            <li>Proper completion of your ${this.appName} booking</li>
          </ul>
          
          <p>If you have any concerns about the service or didn't expect this completion, please contact our support team immediately.</p>
          
          <div style="text-align:center; margin:30px 0;">
            <a href="#" style="background-color:#10b981; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block;">Contact Support</a>
          </div>
          
          <p>Thank you for choosing ${this.appName}!</p>
          
          <p>Best Regards,<br>The ${this.appName} Team</p>
        </div>
        <div style="${styles.footer}">
          <p>&copy; ${year} ${this.appName}. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
    }

    const { otp, expiryTime } = data;
    let otpBoxStyle,
      otpCodeStyle,
      mainTitle,
      additionalContent = "";

    if (type === EmailType.SIGNUP_OTP) {
      otpBoxStyle = "background-color:#f2f7ff; border:1px solid #d0e1fd;";
      otpCodeStyle =
        "font-size:32px; font-weight:bold; color:#0066cc; letter-spacing:5px;";
      mainTitle = `${this.appName} Account Verification`;
      additionalContent = `
        <p>Thank you for signing up with ${this.appName}! To complete your registration, please use the verification code below:</p>
      `;
    } else {
      otpBoxStyle = "background-color:#fff2f2; border:1px solid #ffd0d0;";
      otpCodeStyle =
        "font-size:32px; font-weight:bold; color:#e74c3c; letter-spacing:5px;";
      mainTitle = `${this.appName} Password Reset`;
      additionalContent = `
        <p>We received a request to reset your password for your ${this.appName} account. To proceed with the password reset, please use the verification code below:</p>
        <p>Once verified, you'll be able to set a new password for your account.</p>
        <div style="background-color:#f8f9fa; padding:15px; border-radius:6px; margin-top:20px; font-size:14px;">
          <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately as your account may be at risk.
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${mainTitle}</title>
      </head>
      <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background-color:#f9f9f9;">
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h1 style="${styles.title}">${mainTitle}</h1>
          </div>
          <div style="${styles.content}">
            <p>Hello,</p>
            ${additionalContent}
            
            <div style="${otpBoxStyle} border-radius:6px; padding:15px; margin:20px 0; text-align:center;">
              <div style="${otpCodeStyle}">${otp}</div>
            </div>
            
            <p style="color:#e74c3c; font-size:14px; margin-top:10px;">This code will expire in ${expiryTime}</p>
            
            <p>If you didn't request this code, please ignore this email or contact our support team if you have any concerns.</p>
            
            <p>Best Regards,<br>The ${this.appName} Team</p>
          </div>
          <div style="${styles.footer}">
            <p>&copy; ${year} ${this.appName}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTextContent(type: EmailType, data: any): string {
    if (type === EmailType.VERIFICATION_SUCCESS) {
      const { technicianName } = data;
      return `
        ${this.appName} - Application Approved!
        
        Dear ${technicianName || "Technician"},
        
        Congratulations! Your technician application has been successfully approved by our team.
        
        You can now:
        - Access your full technician dashboard
        - Start receiving service requests
        - Update your profile and services
        - Begin earning with ${this.appName}
        
        Thank you for joining our community of skilled technicians. We're excited to have you on board!
        
        Best Regards,
        The ${this.appName} Team
      `;
    }

    if (type === EmailType.APPLICATION_REJECTED) {
      const { technicianName, reason } = data;
      return `
        ${this.appName} - Application Update
        
        Dear ${technicianName || "Applicant"},
        
        We regret to inform you that your technician application has not been approved at this time.
        
        ${reason ? `Reason: ${reason}` : ""}
        
        We encourage you to:
        - Review your application details
        - Ensure all required documents are properly submitted
        - Consider reapplying after addressing any issues
        - Contact our support team if you have questions
        
        Thank you for your interest in joining ${this.appName}.
        
        Best Regards,
        The ${this.appName} Team
      `;
    }

    if (type === EmailType.BOOKING_COMPLETION_OTP) {
      const { customerName, serviceName, technicianName, otp, bookingId } =
        data;
      return `
    ${this.appName} - Service Completion Verification
    
    Dear ${customerName || "Customer"},
    
    Your ${this.appName} service is being completed! Our technician ${
        technicianName || "Our technician"
      } has finished working on your ${serviceName || "service request"}.
    
    VERIFICATION CODE: ${otp}
    
    Booking ID: #${bookingId ? bookingId.slice(-8).toUpperCase() : "N/A"}
    
    What to do: When your technician asks for the verification code, simply tell them the 6-digit number above.
    
    This verification process ensures:
    - Service has been completed to your satisfaction
    - Secure confirmation between you and the technician
    - Proper completion of your ${this.appName} booking
    
    If you have any concerns about the service or didn't expect this completion, please contact our support team immediately.
    
    Thank you for choosing ${this.appName}!
    
    Best Regards,
    The ${this.appName} Team
  `;
    }

    const { otp, expiryTime } = data;

    if (type === EmailType.SIGNUP_OTP) {
      return `
        ${this.appName} Account Verification
        
        Hello,
        
        Thank you for signing up with ${this.appName}! To complete your registration, please use the verification code below:
        
        ${otp}
        
        This code will expire in ${expiryTime}.
        
        If you didn't request this verification code, please ignore this email or contact our support team if you have any concerns.
        
        Best Regards,
        The ${this.appName} Team
      `;
    } else {
      return `
        ${this.appName} Password Reset
        
        Hello,
        
        We received a request to reset your password for your ${this.appName} account. To proceed with the password reset, please use the verification code below:
        
        ${otp}
        
        This code will expire in ${expiryTime}.
        
        Once verified, you'll be able to set a new password for your account.
        
        Security Notice: If you didn't request a password reset, please ignore this email or contact our support team immediately as your account may be at risk.
        
        Best Regards,
        The ${this.appName} Team
      `;
    }
  }
}

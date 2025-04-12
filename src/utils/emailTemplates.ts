
import { EmailType, APP_NAME } from '../config/emailConfig';

export interface EmailContentResult {
  html: string;
  text: string;
}

export class EmailTemplateService {
  private appName: string = APP_NAME;

  generateEmailContent(type: EmailType, data: any): EmailContentResult {
    return {
      html: this.getHtmlContent(type, data),
      text: this.getTextContent(type, data)
    };
  }

  private getHtmlContent(type: EmailType, data: any): string {
    const { otp, expiryTime } = data;
    const year = new Date().getFullYear();
    
    const styles = {
      container: 'max-width:600px; margin:0 auto; padding:20px; background-color:#ffffff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.1);',
      header: 'text-align:center; padding:20px 0; border-bottom:1px solid #eeeeee;',
      title: 'color:#333333; font-size:24px; margin:0;',
      content: 'padding:30px 20px; color:#555555;',
      footer: 'text-align:center; padding-top:20px; color:#999999; font-size:14px;',
      expiryNote: 'color:#e74c3c; font-size:14px; margin-top:10px;'
    };

    let otpBoxStyle, otpCodeStyle, mainTitle, additionalContent = '';
    
    if (type === EmailType.SIGNUP_OTP) {
      otpBoxStyle = 'background-color:#f2f7ff; border:1px solid #d0e1fd;';
      otpCodeStyle = 'font-size:32px; font-weight:bold; color:#0066cc; letter-spacing:5px;';
      mainTitle = `${this.appName} Account Verification`;
      additionalContent = `
        <p>Thank you for signing up with ${this.appName}! To complete your registration, please use the verification code below:</p>
      `;
    } else {
      otpBoxStyle = 'background-color:#fff2f2; border:1px solid #ffd0d0;';
      otpCodeStyle = 'font-size:32px; font-weight:bold; color:#e74c3c; letter-spacing:5px;';
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
            
            <p style="${styles.expiryNote}">This code will expire in ${expiryTime}</p>
            
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
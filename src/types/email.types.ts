import { OtpPurpose } from '../config/otpConfig';
import { EmailType } from '../config/emailConfig';

export interface EmailTemplate {
  to: string;
  subject: string;
  type: EmailType;
  data: {
    otp: string;
    expiryTime: string;
    purpose?: OtpPurpose;
    [key: string]: any;
  };
}

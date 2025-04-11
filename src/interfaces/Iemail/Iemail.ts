
export interface IemailService {
    sendOtpEmail(toEmail: string, otp: string): Promise<void>;
    sendPasswordResetEmail(toEmail: string, otp: string): Promise<void>;
}
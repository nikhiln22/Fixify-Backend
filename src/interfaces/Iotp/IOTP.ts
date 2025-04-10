
export interface IOTPService {
    generateOtp(): string;
}

export interface OtpVerificationResult {
    success: boolean;
    message: string;
    status: number;
    email?: string;
  }



export enum OtpPurpose {
    REGISTRATION = "REGISTRATION",
    PASSWORD_RESET = "PASSWORD_RESET",
  }
  

  export const OTP_EXPIRY_SECONDS = 60;
  export const TEMP_USER_EXPIRY_SECONDS = 15 * 60; 
  export const OTP_PREFIX = "otp:";
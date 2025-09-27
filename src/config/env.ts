import dotenv from "dotenv";
dotenv.config();

interface Config {
  PORT: number;
  CLIENT_URL: string;
  MONGODB_URI: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  REFRESH_TOKEN_COOKIE_MAX_AGE: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string | null;
  REDIS_USERNAME: string | null;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  NODE_ENV: string;
  STRIPE_SECRET_KEY: string;
  OTP_EXPIRY_SECONDS:number;
  BOOKING_OTP_EXPIRATION_SECONDS:number;
}

function validateEnvVars(): void {
  const requiredEnvVars = [
    "PORT",
    "CLIENT_URL",
    "MONGODB_URI",
    "EMAIL_USER",
    "EMAIL_PASS",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_EXPIRATION",
    "JWT_REFRESH_EXPIRATION",
    "REFRESH_TOKEN_COOKIE_MAX_AGE",
    "REDIS_HOST",
    "REDIS_PORT",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "NODE_ENV",
    "STRIPE_SECRET_KEY",
    "OTP_EXPIRY_SECONDS",
    "BOOKING_OTP_EXPIRATION_SECONDS"
  ];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      console.log(`missing required environment variable:${envVar}`);
    }
  });
}

validateEnvVars();

const config: Config = {
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL: (process.env.CLIENT_URL as string) || "http://localhost:5173",
  MONGODB_URI: process.env.MONGODB_URI as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION as string,
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
  REFRESH_TOKEN_COOKIE_MAX_AGE:
    Number(process.env.REFRESH_TOKEN_COOKIE_MAX_AGE) || 604800000,
  REDIS_HOST: (process.env.REDIS_HOST as string) || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: (process.env.REDIS_PASSWORD as string) || null,
  REDIS_USERNAME: (process.env.REDIS_USERNAME as string) || "default",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as string,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  OTP_EXPIRY_SECONDS: Number(process.env.OTP_EXPIRY_SECONDS) || 300,
  BOOKING_OTP_EXPIRATION_SECONDS: Number(process.env.BOOKING_OTP_EXPIRATION_SECONDS) || 7200,
};

export default config;

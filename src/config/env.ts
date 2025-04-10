import dotenv from 'dotenv'
dotenv.config()

interface Config {
    PORT: number;
    CLIENT_URL: string;
    MONGODB_URL: string;
    EMAIL_USER: string;
    EMAIL_PASS: string
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRATION: string;
    JWT_REFRESH_EXPIRATION: string;
    REDIS_HOST:string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string | null;
}

function validateEnvVars(): void {
    const requiredEnvVars = ['PORT', 'CLIENT_URL', 'MONGODB_URL', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRATION', 'JWT_REFRESH_EXPIRATION','REDIS_HOST', 'REDIS_PORT'];

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            console.log(`missing required environment variable:${envVar}`)
        }
    })
}

validateEnvVars()

const config: Config = {
    PORT: Number(process.env.PORT) || 5000,
    CLIENT_URL: process.env.CLIENT_URL as string || 'http://localhost:5173',
    MONGODB_URL: process.env.MONGODB_URL as string,
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION as string,
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
    REDIS_HOST: process.env.REDIS_HOST as string || '127.0.0.1',
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string || null
}

export default config
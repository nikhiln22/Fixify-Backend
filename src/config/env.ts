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
}

function validateEnvVars(): void {
    const requiredEnvVars = ['PORT', 'CLIENT_URL', 'MONGODB_URL', 'EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'JWT_EXPIRATION', 'JWT_REFRESH_EXPIRATION'];

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
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string
}

export default config
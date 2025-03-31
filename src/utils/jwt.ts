import jwt from 'jsonwebtoken';
import { IjwtService } from '../interfaces/Ijwt/Ijwt'
import config from '../config/env'

export class JWTService implements IjwtService {
    private jwtsecret: string;
    private jwtRefreshSecret: string;
    private jwtExpiration: string | number;
    private jwtRefreshExpiration: string | number;

    constructor() {
        this.jwtsecret = config.JWT_SECRET;
        this.jwtRefreshSecret = config.JWT_REFRESH_SECRET;
        this.jwtExpiration = config.JWT_EXPIRATION;
        this.jwtRefreshExpiration = config.JWT_REFRESH_EXPIRATION;
    }

    generateAccessToken(userId: string): string {
        try {
            return jwt.sign({ userId }, this.jwtsecret, {
                expiresIn: this.jwtExpiration
            });
        } catch (error) {
            console.log("error:", error);
            throw new Error("Error generating access token");

        }
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ userId }, this.jwtRefreshSecret, {
            expiresIn: this.jwtRefreshExpiration as string | number
        })
    }

    verifyAccessToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtsecret);
        } catch (error) {
            console.log("error:", error);
            throw new Error('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): any {
        try {
            return jwt.verify(token, this.jwtRefreshSecret);
        } catch (error) {
            console.log("error:", error);
            throw new Error("Invalid or expired refresh token");
        }
    }

    decodeToken(token: string): any {
        return jwt.decode(token);
    }
}
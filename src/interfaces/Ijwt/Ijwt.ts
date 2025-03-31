
export interface IjwtService {
    generateAccessToken(userId: string): string;
    generateRefreshToken(userId: string): string;
    verifyAccessToken(token: string): any;
    verifyRefreshToken(token: string): any;
    decodeToken(token: string): any;
}
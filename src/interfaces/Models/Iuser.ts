import { Document } from "mongoose";

export interface Iuser extends Document {
    username: string;
    email: string;
    password: string;
    phone: number;
    status: string;
    role: string;
    image?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
import { Document } from "mongoose";

export interface IAdmin extends Document {
    email: string;
    password: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}
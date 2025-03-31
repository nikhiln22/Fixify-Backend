import { Document } from "mongoose";

export interface Iadmin extends Document {
    email: string;
    password: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}
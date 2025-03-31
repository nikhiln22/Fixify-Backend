import mongoose, { Schema } from "mongoose";
import { ItempUser } from "../interfaces/Models/ItempUser";

const tempUserSchema: Schema<ItempUser> = new Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        otp: {
            type: String,
            required: false
        },
        expiresAt: {
            type: Date,
            required: true,
        }
    },
    { timestamps: true }
)

tempUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 900 })

const tempUser = mongoose.model<ItempUser>('tempUser', tempUserSchema);

export default tempUser;
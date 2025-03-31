import mongoose, { Schema } from 'mongoose';
import { Iuser } from '../interfaces/Models/Iuser';

const userSchema: Schema<Iuser> = new Schema(
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
            reuired: true
        },
        phone: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['Active', 'Blocked'],
            default: 'Active'
        },
        image: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
)

const User = mongoose.model<Iuser>('user', userSchema);

export default User;
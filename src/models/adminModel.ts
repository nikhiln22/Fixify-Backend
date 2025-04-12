import mongoose, { Schema } from 'mongoose';
import { Iadmin } from '../interfaces/Models/Iadmin';

const adminSchema: Schema<Iadmin> = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true // ✅ corrected typo
    },
    image: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'admin' // ✅ optional but safe if you created it manually in Atlas
  }
);

const Admin = mongoose.model<Iadmin>('admin', adminSchema);

export default Admin;
     
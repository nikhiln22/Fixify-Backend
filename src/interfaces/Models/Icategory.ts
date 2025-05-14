import { Document } from "mongoose";

export interface Icategory extends Document {
  name: string;
  image: string;
  status: boolean;
}

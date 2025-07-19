import { Document } from "mongoose";

export interface IJobDesignation extends Document {
  designation: string;
  status: boolean;
}

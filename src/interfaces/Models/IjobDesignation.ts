import { Document } from "mongoose";

export interface IJobDesignation extends Document {
  _id: string;
  designation: string;
  status: string;
}

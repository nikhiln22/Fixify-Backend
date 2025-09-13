import { Document } from "mongoose";

export interface IDesignation extends Document {
  _id: string;
  designation: string;
  status: string;
}

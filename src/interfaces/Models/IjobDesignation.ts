import { Document } from "mongoose";

export interface IjobDesignation extends Document {
  designation: string;
  status: Boolean;
}

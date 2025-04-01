import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./GenUser";

/**
* Interface to model GenStatus for TypeScript.
* @param cStatusCode: string 
* @param cStatusName: string 
* @param cStatusDesc: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IStatus extends Document {
  cStatusCode: string;
  cStatusName: string;
  cStatusDesc: string;
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenStatus: Schema = new Schema({
  cStatusCode: {
    type: String,
    required: true,
    unique: true
  },
  cStatusName: {
    type: String,
    required: true,
    unique: true
  },
  cStatusDesc: {
    type: String,
    required: true
  },
  iEnteredby: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  tEntered: {
    type: Date
  },
  iUpdatedby: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  tUpdated: {
    type: Date
  }
});

const Status: Model<IStatus> = model<IStatus>("gen_Status", GenStatus);

export default Status;

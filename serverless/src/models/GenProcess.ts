import { Document, Model, model, Schema } from "mongoose";
import { EnumType } from "typescript";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";

 /**
  * Interface to model GenProcess for TypeScript.
  * @param cProcessCode: string 
  * @param cProcessName: string 
  * @param cProcessDesc: string
  * @param bConfigurable: string
  * @param iStatusID: string
  * @param iEnteredby: string
  * @param tEntered: Date
  * @param iUpdatedby: string
  * @param tUpdated: Date;
  */
export interface IProcess extends Document {
    cProcessCode: string;
    cProcessName: string;
    cProcessDesc: string;
    bConfigurable: string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenProcess: Schema = new Schema({
    cProcessCode: {
    type: String,
    required: true,
    unique: true
  },
  cProcessName: {
    type: String,
    required: true,
    unique: true
  },
  cProcessDesc: {
    type: String,
    required: true
  },
  bConfigurable: {
    type: String,
    enum: ['Y','N'],
    default: 'Y'
  },
  iStatusID: {
    type: Schema.Types.ObjectId,
    ref: "gen_statuses"
  },
  iEnteredby: {
    type: Schema.Types.ObjectId,
    ref: "gen_users"
  },
  tEntered: {
    type: Date
  },
  iUpdatedby: {
    type: Schema.Types.ObjectId,
    ref: "gen_users"
  },
  tUpdated: {
    type: Date
  }
});

const Process: Model<IProcess> = model<IProcess>("gen_processes", GenProcess);

export default Process;

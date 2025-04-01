import { Document, Model, model, Schema } from "mongoose";
import GenAccessType, { IAccessType } from "../models/GenAccessType";
import GenProcess, { IProcess } from "../models/GenProcess";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";


 /**
  * Interface to model GenProcess for TypeScript.
  * @param iAccessTypeID: Number 
  * @param iProcessID: Number 
  * @param cAdd: string
  * @param cEdit: string
  * @param cView: string 
  * @param cDelete: string
  * @param iStatusID: string
  * @param iEnteredby: string
  * @param tEntered: Date
  * @param iUpdatedby: string
  * @param tUpdated: Number;
  */
export interface IPermission extends Document {
    iAccessTypeID: IAccessType["_id"];
    iProcessID: IProcess["_id"];
    cAdd: string;
    cEdit: string;
    cView: string;
    cDelete: string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenPermission: Schema = new Schema({
  iAccessTypeID: {
    type: Schema.Types.ObjectId,
    ref: "gen_accesstypes",
    required: true
  },
  iProcessID: {
    type: Schema.Types.ObjectId,
    ref: "gen_processes",
    required: true
  },
  cAdd: {
    type: String,
    enum: ['Y','N'],
    default: 'N'
  },
  cEdit: {
    type: String,
    enum: ['Y','N'],
    default: 'N'
  },
  cView: {
    type: String,
    enum: ['Y','N'],
    default: 'N'
  },
  cDelete: {
    type: String,
    enum: ['Y','N'],
    default: 'N'
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

const Permission: Model<IPermission> = model<IPermission>("gen_permissions", GenPermission);

export default Permission;

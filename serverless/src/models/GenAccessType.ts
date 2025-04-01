import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";

 /**
* Interface to model GenAccessType for TypeScript.
* @param cAccessCode: string 
* @param cAccessName: string 
* @param cAccessDesc: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
 */
export interface IAccessType extends Document {
    cAccessCode: string;
    cAccessName: string;
    cAccessDesc: string;
    iStatusID: IStatus['_id'];
    iEnteredby: IUser['_id'];
    tEntered: Date;
    iUpdatedby: IUser['_id'];
    tUpdated: Date;
}

const GenAccessTypeSchema: Schema = new Schema({
  cAccessCode: {
    type: String,
    required: true,
    unique: true
  },
  cAccessName: {
    type: String,
    required: true,
    unique: true
  },
  cAccessDesc: {
    type: String,
    required: true
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

const GenAccessType: Model<IAccessType> = model<IAccessType>("gen_accesstypes", GenAccessTypeSchema);

export default GenAccessType;

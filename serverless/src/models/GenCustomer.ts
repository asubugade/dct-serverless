
import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";

/**
* Interface to model GenAccessType for TypeScript.
* @param cAliascode: string 
* @param cAliasname: string 
* @param cIsGlobal: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
 */
export interface ICustomer extends Document {
    cAliascode:string;
    cAliasname:string;
    cIsGlobal:string;
    iStatusID: IStatus['_id'];
    iEnteredby: IUser['_id'];
    tEntered: Date;
    iUpdatedby: IUser['_id'];
    tUpdated: Date;
  }


  const GenCustomer: Schema = new Schema({
    cAliascode: {
    type: String,
    required: true,
    unique: true
  },
  cAliasname: {
    type: String,
    required: true,
    unique: true
  },
  cIsGlobal: {
    type: String,
    enum: ['Global','Non-Global'],
    default: 'Non-Global'
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
  },cTemplateType:{
    type: [Schema.Types.ObjectId]
  }
});


const Customer: Model<ICustomer> = model<ICustomer>("gen_customers", GenCustomer);

export default Customer;
/**
 * Gen Template Types Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	spirgonde <spirgonde@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";

/**
  * Interface to model GenTemplateType for TypeScript.
  * @param cTemplateType: string 
  * @param cTemplateTypeDesc: json
  * @param iStatusID: string
  * @param preFillData: string
  * @param iEnteredby: string
  * @param tEntered: Date
  * @param iUpdatedby: string
  * @param tUpdated: Date;
  */
export interface ITemplateType extends Document {
    cTemplateType: String;
    cTemplateTypeDesc: JSON;
    iStatusID: IStatus['_id'];
    preFillData: String;
    iEnteredby: IUser['_id'];
    tEntered: Date;
    iUpdatedby: IUser['_id'];
    tUpdated: Date;
}

const GenTemplateType: Schema = new Schema({
    cTemplateType: {
    type: String,
    required: true,
    unique: true
  },
  cTemplateTypeDesc: {
    type: JSON,
  },
  iStatusID: {
    type: Schema.Types.ObjectId,
    ref: "gen_statuses"
  },
  preFillData: {
    type: String,
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

const TemplateType: Model<ITemplateType> = model<ITemplateType>("gen_template_types",GenTemplateType);

export default TemplateType;
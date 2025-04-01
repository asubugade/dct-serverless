/**
 * Gen Template Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

 import { Document, Model, model, Schema } from "mongoose";
import { format } from "path";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";
import { ITemplate } from "./GenTemplate";
import { IMember } from "./GenMember";

/**
* Interface to model GenTemplate for TypeScript.
* @param cTemplateName: string
* @param cTemplateType: string
* @param cTemplateSampleFile: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IMemberRestriction extends Document {
  cType: string;
  cTemplateType: string;
  cAllowedScacCode: string;
  cRestrictedScacCode: JSON;
  cExceptionMessage: JSON;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const MemberRestriction: Schema = new Schema({
  cType: {
    type: String,
    required: true,
  },
  cTemplateType: {
    type: String,
    // ref: "gen_templates"
  },
  cAllowedScacCode: {
    type: Schema.Types.String,
    ref: "gen_members"
  },
  cRestrictedScacCode: {
    type: JSON,
    ref: "gen_members"
  },
  cExceptionMessage: {
    type: JSON,
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

const Template: Model<IMemberRestriction> = model<IMemberRestriction>("tmpl_memberrestrictions", MemberRestriction);

export default Template;

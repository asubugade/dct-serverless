/**
 * Gen Template Validations Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";

/**
* Interface to model GenStatus for TypeScript.
* @param cValidateRule: string 
* @param cValidateDescription: string 
* @param cValidateRegex: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
* @param cTemplateType: json //code added by spirgonde for Multiselect dropdown of template type on manage validation screen
*/
export interface ITemplateValidation extends Document {
  cValidateRule: string;
  cValidateDescription: string;
  cValidateRegex: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  cTemplateType: JSON; //code added by spirgonde for Multiselect dropdown of template type on manage validation screen
}

const GenTemplateValidation: Schema = new Schema({
  cValidateRule: {
    type: String,
    required: true,
    unique: true
  },
  cValidateDescription: {
    type: String,
    required: true
  },
  cValidateRegex: {
    type: String,
    required: true,
    unique: true
  },
  cConditionalType: {
    type: String,
    required: true
  },
  cConditionalState: {
    type: String,
  },
  cTemplateType: {//added by spirgonde for Multiselect dropdown of template type on manage validation screen
    // remove type: JSON, and added [Schema.Types.ObjectId] for export listing by spirgonde
    type: [Schema.Types.ObjectId]
  },
  iStatusID: {
    type: Schema.Types.ObjectId,
    ref: "Status"
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
  },
});

const TemplateValidation: Model<ITemplateValidation> = model<ITemplateValidation>("gen_templatevalidations", GenTemplateValidation);

export default TemplateValidation;

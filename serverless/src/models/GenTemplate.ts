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
export interface ITemplate extends Document {
  cTemplateName: string;
  cTemplateType: string;
  cTemplateSampleFile: string;
  cAddtionalFile:string;
  cUploadedFile: JSON;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  iTemplateCounter: number;
}

const GenTemplate: Schema = new Schema({
  cTemplateName: {
    type: String,
    required: true,
    unique: true
  },
  cTemplateType: {
    type: String,
  },
  cTemplateSampleFile: {
    type: String,
  },
  cAddtionalFile: {
    type: String,
  },
  cUploadedFile: {
    type: JSON,
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
  iTempActiveStatus: {
    type: Number,
    enum: [0,-1],
    default: 0
  },
  iUpdatedby: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  tUpdated: {
    type: Date
  },
  iTemplateCounter: { // Add the iTemplateCounter field
    type: Number
  }
});

GenTemplate.pre<ITemplate>("save", async function (next) {
  const template = this;

  // If this is a new template, calculate the next iTemplateCounter value
  if (template.isNew) {
    const lastTemplate = await Template.findOne().sort({ iTemplateCounter: -1 });

    if (lastTemplate && lastTemplate.iTemplateCounter) {
      template.iTemplateCounter = lastTemplate.iTemplateCounter + 1;
    } else {
      template.iTemplateCounter = 1; // Start with 1 if no templates exist
    }
  }
  
  next();
});

const Template: Model<ITemplate> = model<ITemplate>("gen_templates", GenTemplate);

export default Template;

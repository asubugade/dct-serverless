import { Document, Model, model, Schema } from "mongoose";
import { format } from "path";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";
import { IRegion } from "./GenRegion";
/**
* Interface to model GenMessage for TypeScript.
* @param iRegionID: number 
* @param cCode: string 
* @param cName: string 
* @param cCurrencycode: string 
* @param cDefaultcountry: string 
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface ICountry extends Document {
  iRegionID: IRegion['_id']; 
  cCode: string;
  cName: string;
  cCurrencycode: string ;
  cDefaultcountry: string ;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenCountry: Schema = new Schema({
    iRegionID: {
    type: Schema.Types.ObjectId,
    ref: "Region"
      },
      
    cCode: {
    type: String,
    required: true
  },
    cName: {
    type: String,
    required: true,
    unique: true
  },
  cCurrencycode: {
    type: String,
    required: true,
  },
  cDefaultcountry: {
    type: String,
    required: true,
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
  }
});

const Country: Model<ICountry> = model<ICountry>("gen_countries", GenCountry);

export default Country;

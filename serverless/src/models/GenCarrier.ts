/**
 * Gen Carrier Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	spirgonde <spirgonde@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */
import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "./GenStatus";
import User, { IUser } from "./GenUser";

 /**
  * @param cCarrierScac: string 
  * @param cCarrierName: string 
  * @param cAddress: string
  * @param cCity: string
  * @param cState: string
  * @param cContinent: string
  * @param cPostalcode: string;
  * @param cTel : string
  * @param cFax : string
  * @param cCarrierEmail : string
  * @param cContactperson : string 
  * @param cLocationcode : string
  * @param cWebpage : string 
  * @param iStatusID : string 
  * @param tEntered: Date 
  * @param iEnteredby: string
  * @param iUpdatedby: string
  * @param tUpdated: Date
  */
export interface ICarrier extends Document {
  cCarrierScac: string;
  cCarrierName: string;
  cAddress: string;
  cCity: string;
  cState: string;
  cPostalcode: string;
  cContinent: string;
  cTel: string;
  cFax: string;
  cCarrierEmail: string;
  cContactperson: string;
  cLocationcode: string;
  cWebpage: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}


const GenCarrier: Schema = new Schema({
    cCarrierScac: {
    type: String,
    required: true,
    unique: true
  },
  cCarrierName: {
    type: String,
    required: true,
    unique: true
  },
  cAddress: {
    type: String,
    required: true
  },
  cCity: {
    type: String,
    required: true
  },
  cState: {
    type: String,
    required: true
  },
  cPostalcode: {
    type: String,
    required: true
  },
  cContinent: {
    type: String,
    required: true
  },
  cTel: {
    type: String,
    required: true
  },
  cFax: {
    type: String,
    required: true
  },
  cCarrierEmail: {
    type: String,
    required: true
  },
  cContactperson: {
    type: String,
    required: true
  },
  cLocationcode: {
    type: String,
    required: true
  },
  cWebpage: {
    type: String,
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

const Carriers: Model<ICarrier> = model<ICarrier>("gen_carriers", GenCarrier);

export default Carriers;

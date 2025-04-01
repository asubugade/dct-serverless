import { Document, Model, model, Schema } from "mongoose";
import GenAccessType, { IAccessType } from "../models/GenAccessType";
import GenProcess, { IProcess } from "../models/GenProcess";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";


/**
 * Interface to model GenProcess for TypeScript.
 * @param cCode: Number 
 * @param cName: Number 
 * @param cSymbol: string
 * @param cType: string
 * @param cComment: string 
 * @param iStatusID: string
 * @param iEnteredby: string
 * @param tEntered: Date
 * @param iUpdatedby: string
 * @param tUpdated: Date;
 */

export interface ICurrency extends Document {
    cCode: string;
    cName: string;
    cSymbol: string;
    cType: string;
    cComment: string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenCurrency: Schema = new Schema({
    cCode: {
        type: String,
        required: true
    },
    cName: {
        type: String,
        required: true,
        unique: true
    },
    cSymbol: {
        type: String,
        required: true
    },
    cType: {
        type: String,
        enum: ['Local', 'Global'],
        default: 'Local'
    },
    cComment: {
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

const Currency: Model<ICurrency> = model<ICurrency>("gen_currencies", GenCurrency);

export default Currency;

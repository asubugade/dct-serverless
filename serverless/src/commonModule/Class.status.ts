import { ClsDCT_ConfigIntigrations } from '../config/config';
import Status, { IStatus } from "../models/GenStatus";

export class ClsDCT_Status {
    public cStatusCode: string;
    public cStatusName: string;
    public cStatusDesc: string;
    public oStatusDetails: any;

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * To get cStatusCode:cStatusCode
     */
    public FunDCT_getStatusCode() {
        return this.cStatusCode;
    }

    /**
     * To set cStatusCode:cStatusCode
     */
    public FunDCT_setStatusCode(cStatusCode:string) {
        this.cStatusCode = cStatusCode;
    }

    /**
     * To get cStatusName:cStatusName
     */
    public FunDCT_getStatusName() {
        return this.cStatusName;
    }

    /**
     * To set cStatusName:cStatusName
     */
    public FunDCT_setStatusName(cStatusName:string) {
        this.cStatusName = cStatusName;
    }

    /**
     * To get cStatusDesc:cStatusDesc
     */
    public FunDCT_getStatusDesc() {
        return this.cStatusDesc;
    }

    /**
     * To set cStatusDesc:cStatusDesc
     */
    public FunDCT_setStatusDesc(cStatusDesc:string) {
        this.cStatusDesc = cStatusDesc;
    }

    /**
     * To get status details based on 
     * cStatusCode, cStatusName, cStatusDesc
     */
    public FunDCT_getStatusDetails() {
        return this.oStatusDetails;
    }

    /**
     * To set user details
     */
    public async FunDCT_setStatusDetails(cUsing:string, aSelectFields:any) {
        let cColumn:string;
        switch (cUsing) {
            case 'cStatusCode': {
                cColumn = this.cStatusCode;
                break;
            }
            case 'cStatusName': {
                cColumn = this.cStatusName;
                break;
            }            
            case 'cStatusDesc': {
                cColumn = this.cStatusDesc;
                break;
            }        
            default:
                break;
        }
        if (aSelectFields == '') {
            this.oStatusDetails = await Status.findOne({ cUsing: cColumn }).select(aSelectFields);
        } else {
            this.oStatusDetails = await Status.findOne({ cUsing: cColumn });
            if(this.oStatusDetails) {
                //this.cStatusCode = this.oStatusDetails.;
            }
        }
    }
}
export default new ClsDCT_Status();
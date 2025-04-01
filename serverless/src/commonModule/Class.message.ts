import { ClsDCT_ConfigIntigrations } from '../config/config';
import Message, { IMessage } from "../models/GenMessage";

export class ClsDCT_Message {
    public cModuleCode: any;
    public cMessageCode: any;
    public cDescription: any;
    public oMessageDetails: any;
    public cSelectedFields: string;

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * To get Fields
     */
    public FunDCT_getSelectedFields() {
        return this.cSelectedFields;
    }

    /**
     * To set cSelectedFields
     */
    public FunDCT_setSelectedFields(cSelectedFields:string) {
        this.cSelectedFields = cSelectedFields;
    }

    /**
     * To get cModuleCode:cModuleCode
     */
    public FunDCT_getModuleCode() {
        return this.cModuleCode;
    }

    /**
     * To set cModuleCode:cModuleCode
     */
    public FunDCT_setModuleCode(cModuleCode:string) {
        this.cModuleCode = cModuleCode;
    }

    /**
     * To get cMessageCode:cMessageCode
     */
    public FunDCT_getMessageCode() {
        return this.cMessageCode;
    }

    /**
     * To set cMessageCode:cMessageCode
     */
    public FunDCT_setMessageCode(cMessageCode:string) {
        this.cMessageCode = cMessageCode;
    }

    /**
     * To get cDescription:cDescription
     */
    public FunDCT_getDescription() {
        return this.cDescription;
    }

    /**
     * To set cDescription:cDescription
     */
    public FunDCT_setDescription(cDescription:string) {
        this.cDescription = cDescription;
    }

    /**
     * To get message details based on 
     * cModuleCode, cMessageCode, cDescription
     */
    public FunDCT_getMessageDetails() {
        return this.oMessageDetails;
    }

    /**
     * To set message details
     * aSelectFields:any[]
     */
    public async FunDCT_setMessageDetails() {
        try {
            var cQueryUsing:any = {};
            var aResMessageDetails:any = {};
            const aUsing = new Array();

            if(this.cModuleCode) {
                cQueryUsing["cModuleCode"] = this.cModuleCode;
            } else {
                return aUsing.push({ ['cMessageCode']: 'SERVER_ERROR',['cModuleCode']: 'APPLICATION', ['cDescription']: 'WWA-DCT: Internal Server Error' });
            }

            if(this.cMessageCode) {
                cQueryUsing["cMessageCode"] = this.cMessageCode;
            } else {
                return aUsing.push({ ['cMessageCode']: 'SERVER_ERROR',['cModuleCode']: 'APPLICATION', ['cDescription']: 'WWA-DCT: Internal Server Error' });
            }

            const oMessages:any = await Message.find(cQueryUsing);
            if(oMessages) {
                aUsing.push({ ['cMessageCode']: oMessages[0].cMessageCode,['cModuleCode']: oMessages[0].cModuleCode, ['cDescription']: oMessages[0].cDescription });
            } else {
                aUsing.push({ ['cMessageCode']: 'SERVER_ERROR',['cModuleCode']: 'APPLICATION', ['cDescription']: 'WWA-DCT: Internal Server Error' });
            }            

            return aUsing;

        } catch (err) { 
            return err;
        }
    }
}
export default new ClsDCT_Message();
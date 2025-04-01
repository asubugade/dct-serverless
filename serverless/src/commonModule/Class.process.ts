/**
 * To GET Process related data based on set parameter
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { ClsDCT_ConfigIntigrations } from '../config/config';
import GenProcess, { IProcess } from "../models/GenProcess";

export class ClsDCT_Process {
    public iProcessID: any;
    public cProcessCode: any;
    public cProcessName: any;
    public cProcessDesc: any;
    public oProcessDetails = new Array();

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * To get iProcessID
     */
     public async FunDCT_GetProcessProcessID() {
        return this.iProcessID;
    }

    /**
     * To set iProcessID
     * @param iProcessID string
     */
    public async FunDCT_SetProcessProcessID(iProcessID:string) {
        this.iProcessID = iProcessID;
    }



    /**
     * To get cProcessCode
     */
     public async FunDCT_GetProcessCode() {
        return this.cProcessCode;
    }

    /**
     * To set cProcessCode
     * @param cProcessCode string
     */
    public async FunDCT_SetProcessCode(cProcessCode:string) {
        this.cProcessCode = cProcessCode;
        this.oProcessDetails.push({['cProcessCode']:this.cProcessCode});
    }




    /**
     * To get cProcessName
     */
    public async FunDCT_GetProcessName() {
        return this.cProcessName;
    }

    /**
     * To set cProcessName
     * @param cProcessName string
     */
    public async FunDCT_SetProcessName(cProcessName:string) {
        this.cProcessName = cProcessName;
        this.oProcessDetails.push({['cProcessName']:this.cProcessName});
    }



    /**
     * To get cProcessDesc
     */
     public FunDCT_GetProcessDesc() {
        return this.cProcessDesc;
    }

    /**
     * To set cProcessDesc
     * @param cProcessDesc string
     */
    public FunDCT_SetProcessDesc(cProcessDesc:string) {
        this.cProcessDesc = cProcessDesc;
        this.oProcessDetails.push({['cProcessDesc']:this.cProcessDesc});
    }


    /**
     * To set Template Details according to template
     */
    public async FunDCT_SetProcessDetails() {
        try {
            var cQueryUsing:any = {};
            if(this.iProcessID) {
                cQueryUsing["iProcessID"] = this.iProcessID;
            }
            if(this.cProcessCode) {
                cQueryUsing["cProcessCode"] = this.cProcessCode;
            }
            if(this.cProcessName) {
                cQueryUsing["cProcessName"] = this.cProcessName;
            }

            const oProcessDetails:any = await GenProcess.find(cQueryUsing);
            if(oProcessDetails) {
                this.FunDCT_SetProcessProcessID(oProcessDetails[0]._id);
                this.FunDCT_SetProcessCode(oProcessDetails[0].cProcessCode);
                this.FunDCT_SetProcessName(oProcessDetails[0].cProcessName);
                this.FunDCT_SetProcessDesc(oProcessDetails[0].cProcessDesc);
                return oProcessDetails;
            }
        } catch (err) { 
            return err;
        }
    }
    
    /**
     * To get Template Details according to template
     */
    public async FunDCT_GetProcessDetails() {
        return this.oProcessDetails;
    }



}
export default new ClsDCT_Process();
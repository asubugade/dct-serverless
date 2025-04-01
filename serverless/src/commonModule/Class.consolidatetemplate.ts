/**
 * Class - To Manage Template File
 * To Create Excel File from Python Script
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import Template, { ITemplate } from "../models/GenTemplate";
import TmplMetaData, { ITmplMetaData } from "../models/Tmplmetadata";
import TmplUploadLog, { ITmplUploadLog } from "../models/Tmpluploadlog";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../models/MemTmplUploadLog";
import Status, { IStatus } from "../models/GenStatus";
import TmplConsolidationReq, { ITmplConsolidationReq } from "../models/TmplConsolidationReq";

import { ClsDCT_Common } from "./Class.common";
import * as _ from "lodash";
import { PythonShell } from 'python-shell';
import fs from 'fs';
import multer from 'multer';

import { spawn } from "child_process";
import { json } from "express";
const { once } = require('events'); // Added in Node 11.13.0

import { ClsDCT_ValidationRule } from '../module/Class.validationrule';
// import { Mongoose, MongooseDocument, Schema, SchemaType } from "mongoose";
var mongoose = require('mongoose');
import { ClsDCT_EmailTemplate } from "./Class.emailtemplate";
import GenAccessType, { IAccessType } from "../models/GenAccessType"//code added by spirgonde for Autogenerate Consolidation report on template expired
import User, { IUser } from "../models/GenUser";//code added by spirgonde for Autogenerate Consolidation report on template expired
import GenTemplateType, { ITemplateType } from "../models/GenTemplateType";
const BufferReader = require('buffer-reader');


export class ClsDCT_ConsolidateTemplate extends ClsDCT_Common {
    
    public _cConsolidateFileName: string;
    public _oEmailTemplateCls = new ClsDCT_EmailTemplate();
    private _oCommonCls = new ClsDCT_Common();//added by spirgonde for Autogenerate Consolidation report on template expired

    public _oGetTemplateMetaDataDetails: any;
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * To get iTemplateID
     */
     public FunDCT_GetTemplateID() {
        return this.iTemplateID;
    }

    /**
     * To set iTemplateID
     * @param iTemplateID string
     */
    public FunDCT_SetTemplateID(iTemplateID: string) {
        this.iTemplateID = iTemplateID;
    }

    /**
     * To Check pending Consolidation Request
     * @returns array
     */
     public async FunDCT_GetPendingConsolidationRequest() {
        try {
            this._oCommonCls.FunDCT_setUserID('0001')
            this._oCommonCls.FunDCT_ApiRequest({baseUrl:'/API/CONSOLIDATION/'})

            let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            // let oPendingConslReq = await TmplConsolidationReq.find({iStatusID: iStatusID, bProcesslock: 'Y'}, (err, oPendingConslReq) => {
            //     if (err) {
            //         return;
            //     }
            //     return oPendingConslReq.length;
            // });
            let oPendingConslReq = await TmplConsolidationReq.find({iStatusID: iStatusID, bProcesslock: 'Y'});
             
            let iInProgressFile = oPendingConslReq.length
            if(iInProgressFile <= 0) {
                const oPendingConslReq: ITmplConsolidationReq = await TmplConsolidationReq.findOne({ iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N' });
                if (oPendingConslReq) {
                    const aRequestDetails = { bProcesslock: 'Y', tProcessStart: new Date(), tUpdated: new Date() };
                    if (aRequestDetails) {
                        this.FunDCT_SetTemplateID(oPendingConslReq.iTemplateID)
                        await TmplConsolidationReq.findOneAndUpdate(
                            { iStatusID: iStatusID, _id: oPendingConslReq._id },
                            { $set: aRequestDetails },
                            { new: true }
                        );
                    }
                    return oPendingConslReq;
                }
            } else {
                return false;
            }
        } catch (err) {
            this._oCommonCls.error(err.message);
            // process.exit(1);
        }
    }

    public async FunDCT_ConsolidateTemplate(){
        try{
            this._oCommonCls.FunDCT_setUserID('0001')
            let stream = '/CRON/CONSOLIDATION/'+ this.iTemplateID
            this._oCommonCls.FunDCT_ApiRequest({baseUrl:'/API/CONSOLIDATION/'})

            const oPendingConslReq: any = await this.FunDCT_GetPendingConsolidationRequest();
            if (typeof oPendingConslReq === 'undefined' || oPendingConslReq == false) {
                return "Consolidation Files In Progress or No Pending Files";
            }
            this._oCommonCls.FunDCT_SetCurrentUserDetailsByID(oPendingConslReq.iEnteredby);
            let userID =this._oCommonCls.FunDCT_getUserID()
            //Add Template Loop
            this._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": this.iTemplateID });
            let oTemplate: ITemplate = await Template.findOne({ _id: new mongoose.Types.ObjectId(this.iTemplateID) });
            let cTemplateType = oTemplate.cTemplateType;
            let oTemplateType: ITemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType});
            const oParams = {
                'cDirFile': this.cDirConsolidationTemplate, 'iTemplateID': this.iTemplateID, 'cRequestType':  oPendingConslReq['_doc'].cRequestType,
                'cUserID':userID?userID:'0001',
                'cType':stream,
                'startHeaderRowIndex': this._oGetTemplateMetaDataDetails[0]['startHeaderRowIndex'],
                'preFillData':oTemplateType.preFillData,
            };
            this.log(`ConsolidateTemplate.py para: ${oParams}`);
            const cScript = this.cDirPythonPath + 'ConsolidateTemplate.py';
            const oPyArgs = [cScript, JSON.stringify(oParams)]
            const oCreateFile = spawn(process.env.PYTHON_PATH, oPyArgs);
            let oResPyProg: any;
            oCreateFile.stdout.on('data', function (data) {
                // oResPyProg = JSON.parse(data.toString('utf8'))
                try {
                    oResPyProg = JSON.parse(data.toString('utf8'));
                } catch (error) {
                    oResPyProg = undefined;
                }
            });
            // oCreateFile.stderr.on('data', (data) => {
            //     oResPyProg += JSON.stringify(data.toString('utf8'))
            // });
            oCreateFile.stderr.on('error', (data) => {
                oResPyProg = undefined
            });
            oCreateFile.stderr.on('data', (data) => {
                let bufferData = new BufferReader(data)
                // let __nBytes = bufferData.restAll()
                let iLength = bufferData.buf.length
                let arr=[];
                for (let index = 1; index < iLength; index++) {
                    try {
                        arr.push(bufferData.nextString(index))
                    } catch (error) {
                        arr.push('')
                    }
                }
                console.log(arr.join(''));
                this.log(arr.join(''))
                // oResPyProg += JSON.parse(data.toString('utf8'))
            });

            await once(oCreateFile, 'close');

            if (oResPyProg.cStatus == 'Success') {
                let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
                if (!oStatus) {
                    return [];
                }
                let iStatusID = oStatus._id;
                let cTemplateStatusFile = oResPyProg.oResponse;
                let existingData = await TmplConsolidationReq.findOne({ iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq._id) });
                const IsConsolidationRequested = { 
                    cRequestType: existingData.IsConsolidationRequested['cRequestType'],
                    iEnteredby: existingData.IsConsolidationRequested['iEnteredby'],
                    iTemplateID: existingData.IsConsolidationRequested['iTemplateID'],
                    IsAlreadyRequested: false 
                }
                const aRequestDetails = { cTemplateStatusFile: oResPyProg.oResponse, IsConsolidationRequested:IsConsolidationRequested, bProcesslock: 'N', bProcessed: 'Y', tProcessEnd: new Date(), tUpdated: new Date() };
                await TmplConsolidationReq.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq._id) },
                    { $set: aRequestDetails },
                    { new: true }
                );

                const oTemplateDetails = await this.FunDCT_GetTemplateDetails(this.iTemplateID)


                await this.FunDCT_SendConsolidateFile(cTemplateStatusFile, oTemplateDetails, oParams);

                return oResPyProg.oResponse
            }
        } catch (oErr) {
            let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            let oPendingConslReq = await TmplConsolidationReq.find({iStatusID: iStatusID, bProcesslock: 'Y'});
            let existingData = await TmplConsolidationReq.findOne({ iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) });
            const IsConsolidationRequested = { 
                cRequestType: existingData.IsConsolidationRequested['cRequestType'],
                iEnteredby: existingData.IsConsolidationRequested['iEnteredby'],
                iTemplateID: existingData.IsConsolidationRequested['iTemplateID'],
                IsAlreadyRequested: false 
            }
            const aRequestDetails = { IsConsolidationRequested:IsConsolidationRequested, bExceptionfound: 'Y', bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
            this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
            let data = await TmplConsolidationReq.findOneAndUpdate(
                { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) },
                { $set: aRequestDetails },
                { new: true }
            );
            
            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }

    public async FunDCT_SendConsolidateFile(cTemplateStatusFile, oTemplateDetails, oParams) {
        // let CONSOLIDATEFILE = this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + cTemplateStatusFile;
        let CONSOLIDATEFILE = `${this.cFrontEndURILocal}sessions/s3download?downloadpath=${cTemplateStatusFile}`;

        const aVariablesVal = {
            DCTVARIABLE_USERNAME: this._oCommonCls.FunDCT_getUsername(),
            DCTVARIABLE_FILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + cTemplateStatusFile,
            DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
            DCTVARIABLE_REQUEST_TYPE: oParams.cRequestType
            // DCTVARIABLE_CONSOLIDATEFILE: CONSOLIDATEFILE,
        };
        let cEmail = this._oCommonCls.FunDCT_getEmail();
        const aUploadTemplateEmail = this._oEmailTemplateCls.FunDCT_SendNotification('CONSOLIDATE_TEMPLATE', 'Consolidate Report', aVariablesVal, cEmail)
    }

    //code added by spirgonde for Autogenerate Consolidation report on template expired start ....
    /**
     * Function to check following conditions
     * 1. If todays date is greater than member cut off.
     * 2. cheking if template meta data  has cConsolidation as Yes .
     * 3. If template is already not consolidated by autogenerate consolidation request .(i.e cGenerated == 'No')
     * If all above  conditions are followed then  consolidation request is inserted in  database. 
     */
     public async FunDCT_AutogenerateConsolidation() {
        let oTmplMetaData = await TmplMetaData.find({});
        for (let i = 0; i < oTmplMetaData.length; i++) {
            if (oTmplMetaData[i]['aMemberCutoffs'] && oTmplMetaData[i]['cConsolidation'] == 'Yes' && oTmplMetaData[i]['cGenerated'] == 'No') {
                let bConsolidate: boolean = false;
                for (let member of Object.keys(oTmplMetaData[i]['aMemberCutoffs'])) {
                    let memberObject = oTmplMetaData[i]['aMemberCutoffs'][member];
                    for (const [key, value] of Object.entries(memberObject)) {
                        let cutoffdate = Object(value)["tCuttoffdate"];
                        let tCuttoffdateMember = new Date(cutoffdate);
                        let todaysDate = new Date();
                        if (todaysDate > tCuttoffdateMember) {
                           bConsolidate = true;
                        }
                    }
                }
                if (bConsolidate) {
                    let iTemplateID = oTmplMetaData[i]['iTemplateID'];
                    await this.FunDCT_InsertConsolidationRequest(iTemplateID, oTmplMetaData[i]['_id'])
                }

            }
        }
    }

    /**
     * Function to insert consolidation request 
     * @param iTemplateID 
     * @param iTmplMetaDataID 
     */
    async FunDCT_InsertConsolidationRequest(iTemplateID, iTmplMetaDataID) {

        let oAccessTypeAdmin = await GenAccessType.findOne({ "cAccessCode": 'Admin' });
        let iEnteredbyAdmin: IUser = await User.findOne({ iAccessTypeID: new mongoose.Types.ObjectId(oAccessTypeAdmin._id) }).select('_id');
        let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
        const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);
        let IsConsolidationRequested = {
            iEnteredby: iEnteredbyAdmin,
            iTemplateID,
            cRequestType:'ALL',
            IsAlreadyRequested: true,
          }
        const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, bProcesslock: 'N', iStatusID: oStatus._id, iEnteredby: iEnteredbyAdmin, tEntered: new Date(), cRequestType: 'ALL', IsConsolidationRequested};
        let oTemplates = new TmplConsolidationReq(aRequestDetails);
        await oTemplates.save();
        await TmplMetaData.findOneAndUpdate(
            { _id: iTmplMetaDataID },
            { $set: { cGenerated: 'Yes' } }
        );

    }
    //code added by spirgonde for Autogenerate Consolidation report on template expired end .

}
export default new ClsDCT_ConsolidateTemplate();
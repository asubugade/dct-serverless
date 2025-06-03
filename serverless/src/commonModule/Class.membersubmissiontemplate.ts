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
import MemberSubmissionDownloadLog, { IMemberSubmissionDownloadLog } from "../models/MemberSubmissionDownloadLog";
import { ClsDCT_Common } from "./Class.common";
import * as _ from "lodash";
import { PythonShell } from 'python-shell';
import fs from 'fs';
import multer from 'multer';
// const logOutput = (name) => (data) => this.logger.log(`[${name}] ${data}`);

import { spawn } from "child_process";
import { json } from "express";
const { once } = require('events'); // Added in Node 11.13.0

import { ClsDCT_ValidationRule } from './Class.validationrule';
// import { Mongoose, MongooseDocument, Schema, SchemaType } from "mongoose";
var mongoose = require('mongoose');
import { ClsDCT_EmailTemplate } from "./Class.emailtemplate";
import GenAccessType, { IAccessType } from "../models/GenAccessType"//code added by spirgonde for Autogenerate Consolidation report on template expired
import User, { IUser } from "../models/GenUser";//code added by spirgonde for Autogenerate Consolidation report on template expired
import GenTemplateType, { ITemplateType } from "../models/GenTemplateType";
const BufferReader = require('buffer-reader');

export class ClsDCT_MemberSubmissionTemplate extends ClsDCT_Common {

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
    public async FunDCT_GetPendingMemberSubmissionRequest() {
        try {
            this.FunDCT_setUserID('0001')
            this.FunDCT_ApiRequest({ baseUrl: '/API/MEMBER_SUBMISSION_REQUEST/' })
            let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            // let oPendingConslReq = await MemberSubmissionDownloadLog.find({iStatusID: iStatusID, bProcesslock: 'Y'}, (err, oPendingConslReq) => {
            //     if (err) {
            //         return;
            //     }
            //     return oPendingConslReq.length;
            // });
            let oPendingConslReq = await MemberSubmissionDownloadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y' });

            let iInProgressFile = oPendingConslReq.length
            if (iInProgressFile <= 0) {
                const oPendingConslReq: IMemberSubmissionDownloadLog = await MemberSubmissionDownloadLog.findOne({ iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N' });
                if (oPendingConslReq) {
                    const aRequestDetails = { bProcesslock: 'Y', tProcessStart: new Date(), tUpdated: new Date() };
                    if (aRequestDetails) {
                        this.FunDCT_SetTemplateID(oPendingConslReq.iTemplateID)
                        await MemberSubmissionDownloadLog.findOneAndUpdate(
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

    public async FunDCT_MemberSubmissionTemplate() {
        try {
            this.FunDCT_setUserID('0001')
            this.FunDCT_ApiRequest({ baseUrl: '/API/MEMBER_SUBMISSSION_TEMPLATE_DOWNLOAD_REQUEST/' })
            const oPendingConslReq: any = await this.FunDCT_GetPendingMemberSubmissionRequest();
            if (typeof oPendingConslReq === 'undefined' || oPendingConslReq == false) {
                return "Member Submission Files In Progress or No Pending Files";
            }
            this._oCommonCls.FunDCT_SetCurrentUserDetailsByID(oPendingConslReq.iEnteredby);
            //Add Template Loop
            let userID = this._oCommonCls.FunDCT_getUserID()

            this._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": this.iTemplateID });
            let oTemplate: ITemplate = await Template.findOne({ _id: new mongoose.Types.ObjectId(this.iTemplateID) });
            let cTemplateType = oTemplate.cTemplateType;
            let oTemplateType: ITemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType });
            const oParams = {
                'cDirFile': this.cDirConsolidationTemplate, 'iTemplateID': this.iTemplateID, 'SCAC': oPendingConslReq['_doc'].aMemberScacCode,
                'cUserID': userID ? userID : '0001',
                'cType': 'MemberConsolidate',
                'startHeaderRowIndex': this._oGetTemplateMetaDataDetails[0]['startHeaderRowIndex'],
                'preFillData': oTemplateType.preFillData,
            };
            this._oCommonCls.log(`MemberConsolidate.py == request == > ${JSON.stringify(oParams)}`)
            const cScript = this.cDirPythonPath + 'MemberConsolidate.py';
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
                let arr = [];
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
            this._oCommonCls.log(`MemberConsolidate.py == response == > ${JSON.stringify(oResPyProg)}`)

            if (oResPyProg.cStatus == 'Success') {
                let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
                if (!oStatus) {
                    return [];
                }
                this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
                let iStatusID = oStatus._id;
                let cTemplateStatusFile = oResPyProg.oResponse;
                let existingData = await MemberSubmissionDownloadLog.findOne({ iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq._id) });
                const IsConsolidationRequested = {
                    aMemberScacCode: existingData.IsConsolidationRequested['aMemberScacCode'],
                    iEnteredby: existingData.IsConsolidationRequested['iEnteredby'],
                    iTemplateID: existingData.IsConsolidationRequested['iTemplateID'],
                    IsAlreadyRequested: false
                }
                const aRequestDetails = { cTemplateStatusFile: oResPyProg.oResponse, IsConsolidationRequested: IsConsolidationRequested, bProcesslock: 'N', bProcessed: 'Y', tProcessEnd: new Date(), tUpdated: new Date() };
                await MemberSubmissionDownloadLog.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq._id) },
                    { $set: aRequestDetails },
                    { new: true }
                );

                const oTemplateDetails = await this.FunDCT_GetTemplateDetails(this.iTemplateID)


                await this.FunDCT_SendMemberSubmissionFile(cTemplateStatusFile, oTemplateDetails);

                return oResPyProg.oResponse
            }
        } catch (oErr) {
            let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            let oPendingConslReq = await MemberSubmissionDownloadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y' });
            let existingData = await MemberSubmissionDownloadLog.findOne({ iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) });
            const IsConsolidationRequested = {
                aMemberScacCode: existingData.IsConsolidationRequested['aMemberScacCode'],
                iEnteredby: existingData.IsConsolidationRequested['iEnteredby'],
                iTemplateID: existingData.IsConsolidationRequested['iTemplateID'],
                IsAlreadyRequested: false
            }
            const aRequestDetails = { IsConsolidationRequested: IsConsolidationRequested, bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
            this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
            let data = await MemberSubmissionDownloadLog.findOneAndUpdate(
                { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) },
                { $set: aRequestDetails },
                { new: true }
            );

            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }

    public async FunDCT_SendMemberSubmissionFile(cTemplateStatusFile, oTemplateDetails) {
        const aVariablesVal = {
            DCTVARIABLE_USERNAME: this._oCommonCls.FunDCT_getUsername(),
            DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
            DCTVARIABLE_FILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + cTemplateStatusFile,
        };
        let cEmail = this._oCommonCls.FunDCT_getEmail();
        const aUploadTemplateEmail = this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_SUBMISSION_TEMPLATE', 'Member Subscription Report', aVariablesVal, cEmail)
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
        const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, bProcesslock: 'N', iStatusID: oStatus._id, iEnteredby: iEnteredbyAdmin, tEntered: new Date() };
        let oTemplates = new MemberSubmissionDownloadLog(aRequestDetails);
        await oTemplates.save();
        await TmplMetaData.findOneAndUpdate(
            { _id: iTmplMetaDataID },
            { $set: { cGenerated: 'Yes' } }
        );

    }
    //code added by spirgonde for Autogenerate Consolidation report on template expired end .


    public getMemberSubmissionJDump = async (iTemplateTypeID: any, memberSubmissionId: any) => {
        try {
            this.FunDCT_setUserID('0001')
            this.FunDCT_ApiRequest({ baseUrl: '/API/MEMBER_SUBMISSSION_TEMPLATE_DOWNLOAD_REQUEST/' })
            const oPendingConslReq: any = await this.getPendingMemberSubmissionRequest(memberSubmissionId);
            if (typeof oPendingConslReq === 'undefined' || oPendingConslReq == false) {
                return "Member Submission Files In Progress or No Pending Files";
            }
            this.FunDCT_SetTemplateID(oPendingConslReq.iTemplateID)
            this._oCommonCls.FunDCT_SetCurrentUserDetailsByID(oPendingConslReq.iEnteredby);
            //Add Template Loop
            let userID = this._oCommonCls.FunDCT_getUserID()

            this._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": this.iTemplateID });
            let oTemplate = await Template.findOne({ _id: new mongoose.Types.ObjectId(this.iTemplateID) }).lean() as ITemplate;
            let cTemplateType = oTemplate.cTemplateType;
            let oTemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType }).lean() as ITemplateType;
            const oParams = {
                cDirFile: this.cDirConsolidationTemplate, iTemplateID: this.iTemplateID, SCAC: oPendingConslReq.aMemberScacCode,
                cUserID: userID ? userID : '0001',
                cType: 'MemberConsolidate',
                startHeaderRowIndex: this._oGetTemplateMetaDataDetails[0]['startHeaderRowIndex'],
                preFillData: oTemplateType.preFillData,
                _iTemplateMemberSubmissionID: oPendingConslReq._id,
            };
            const laneSchedule = {
                iTemplateTypeID: iTemplateTypeID,
                jDump: oParams
            }
            return laneSchedule
        } catch (oErr) {
            let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            let oPendingConslReq = await MemberSubmissionDownloadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y' });
            let existingData = await MemberSubmissionDownloadLog.findOne({ iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) }).lean() as IMemberSubmissionDownloadLog;
            const IsConsolidationRequested = {
                aMemberScacCode: existingData.IsConsolidationRequested['aMemberScacCode'],
                iEnteredby: existingData.IsConsolidationRequested['iEnteredby'],
                iTemplateID: existingData.IsConsolidationRequested['iTemplateID'],
                IsAlreadyRequested: false
            }
            const aRequestDetails = { IsConsolidationRequested: IsConsolidationRequested, bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
            this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
            let data = await MemberSubmissionDownloadLog.findOneAndUpdate(
                { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) },
                { $set: aRequestDetails },
                { new: true }
            );

            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }

    public getPendingMemberSubmissionRequest = async (_id: any) => {
        try {
            this.FunDCT_setUserID('0001');
            this.FunDCT_ApiRequest({ baseUrl: '/API/MEMBER_SUBMISSION_REQUEST/' });
            let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;

            if (!oStatus) {
                return [];
            }

            let iStatusID = oStatus._id;
            const oPendingConslReq = await MemberSubmissionDownloadLog.findOne({
                _id: _id,
                iStatusID: iStatusID,
                bProcesslock: 'N',
                bProcessed: 'N'
            }).lean() as IMemberSubmissionDownloadLog;

            return oPendingConslReq || false;
        } catch (err: any) {
            this._oCommonCls.error(err.message);
        }
    }

}
export default new ClsDCT_MemberSubmissionTemplate();
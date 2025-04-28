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
import Message, { IMessage } from "../models/GenMessage";
import User, { IUser } from "../models/GenUser";
import Template, { ITemplate } from "../models/GenTemplate";
import TmplMetaData, { ITmplMetaData } from "../models/Tmplmetadata";
import TmplUploadLog, { ITmplUploadLog } from "../models/Tmpluploadlog";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../models/MemTmplUploadLog";
import Status, { IStatus } from "../models/GenStatus";
import Additionalfields, { IAdditionalFields } from "../models/Additionalfields";
import { ClsDCT_Common } from "./Class.common";
import { ClsDCT_EmailTemplate } from "./Class.emailtemplate";
import * as _ from "lodash";
import fs from 'fs';
const xlsx = require('xlsx');
import { spawn } from "child_process";
import { ClsDCT_ConsolidateTemplate } from "./Class.consolidatetemplate";
import TemplateValidation, { ITemplateValidation } from "../models/GenTemplateValidation";
import GenTemplateType, { ITemplateType } from "../models/GenTemplateType"
import axios from 'axios';

// import MemberUploadController from "src/controllers/MemberUploadController";
const { once } = require('events'); // Added in Node 11.13.0
var mongoose = require('mongoose')
import * as path from 'path';
import GenMember, { IMember } from "../models/GenMember";
import { S3ClientClass } from "../middleware/aws-s3-client";
const oMimeType = require('mime-types');
const BufferReader = require('buffer-reader');

import GenEmailtemplates, { IEmailtemplates } from "../models/GenEmailtemplates";
import TemplateType from "../models/GenTemplateType";
import GenLane from "../models/GenLane";
import GenLaneSchedule from "../models/GenLaneSchedule";

export class ClsDCT_ManageTemplate extends ClsDCT_Common {
    public cTemplateName: any;
    public cTemplateSampleFile: any;
    declare public cDescription: any;
    public oTemplateDetails: any;
    public cSelectedFields: string;

    public cSampleTemplateFileName: string;//used for sample template file name

    public oStorage: any;
    public oFileUpload: any;
    public _cTempFileImportExcelToJSON: string;
    public _cFileTypeImportExcelToJSON: string;
    public _cImportedExcelToJSONSuccessFile: string;

    public cTemplateType: string;

    public aStructuredHeaderFromExcel: any;

    public _cTempFileUploadTemplate: string;
    public _cFileTypeUploadTemplate: string;

    public _iTemplateID: string;

    public _iTemplateUploadLogID: string;
    public _cUserID: string;
    public _cValidateTmplateStatusFile: string;
    public _oGetMessageDetailsModules: any;
    public _oGetTemplateMetaDataDetails: any;

    public _oGetValidationRulesDetails: any;
    public _cImportHeaderVaidationRuleFile: string;

    public _oValidationRuleCls: any;

    public _cUploadType: string;
    public _cCompanyname: string;

    public _cValidateTemplateFileJSON: any; //Template Validation Header Level Json for Last Level Row only
    public _cValidateMessageFileJSON: any; //Template Validation Success/Error Message Json
    public _cValidatedExcelToJSONSuccessFile: any; //Template Validation Success/Error Message Json
    public _cTemplateCommentsFileJSON: any; //Template Validation Success/Error Message Json

    public tCuttoffdate: any;//added by stewari

    public _oEmailTemplateCls: any = new ClsDCT_EmailTemplate();
    private _oCommonCls = new ClsDCT_Common();
    private isRateExtendMode = 'false';
    /**
     * Constructor
     */
    constructor() {
        super();
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
    public FunDCT_setSelectedFields(cSelectedFields: string) {
        this.cSelectedFields = cSelectedFields;
    }

    /**
     * To get TemplateID
     */
    public FunDCT_getTemplateID() {
        return this._iTemplateID;
    }

    /**
     * To set TemplateID
     */
    public FunDCT_setTemplateID(cTemplateID: string) {
        // this._iTemplateID = new Schema.Types.ObjectId(cTemplateID);
        this._iTemplateID = cTemplateID;
    }

    /**
     * To get cTemplateName:cTemplateName
     */
    public FunDCT_getTemplateName() {
        return this.cTemplateName;
    }

    /**
     * To set cTemplateName:cTemplateName
     */
    public FunDCT_setTemplateName(cTemplateName: string) {
        this.cTemplateName = cTemplateName;
    }

    /**
     * To get cTemplateSampleFile:cTemplateSampleFile
     */
    public FunDCT_getTemplateSampleFile() {
        return this.cTemplateSampleFile;
    }

    /**
     * To set cTemplateName:cTemplateName
     */
    public FunDCT_setTemplateSampleFile(cTemplateName: string) {
        this.cTemplateName = cTemplateName;
    }

    /**
     * To get template details based on 
     * cTemplateName, cTemplateSampleFile
     */
    public FunDCT_getTemplateDetails() {
        return this.oTemplateDetails;
    }


    /**
     * To set _cTempFileUploadTemplate
     */
    public FunDCT_setTempFileUploadTemplate(_cTempFileUploadTemplate: string) {
        this._cTempFileUploadTemplate = _cTempFileUploadTemplate;
    }

    /**
     * To get template details _cTempFileUploadTemplate 
     */
    public FunDCT_getTempFileUploadTemplate() {
        return this._cTempFileUploadTemplate;
    }

    /**
     * To set _cFileTypeUploadTemplate
     */
    public FunDCT_setFileTypeUploadTemplate(cFileTypeUploadTemplate: string) {
        this._cFileTypeUploadTemplate = cFileTypeUploadTemplate;
    }

    /**
     * To get template details _cFileTypeUploadTemplate 
     */
    public FunDCT_getFileTypeUploadTemplate() {
        return this._cFileTypeUploadTemplate;
    }

    /**
     * To set _oValidationRuleCls
     */
    public FunDCT_SetValidationRules(_oValidationRuleCls: any) {
        this._oValidationRuleCls = _oValidationRuleCls;
    }

    /**
     * To get _oValidationRuleCls
     */
    public FunDCT_GetValidationRules() {
        return this._oValidationRuleCls;
    }

    /**
     * To get _iTemplateUploadLogID
     */
    public FunDCT_getTemplateUploadLogID() {
        return this._iTemplateUploadLogID;
    }

    /**
     * To set _iTemplateUploadLogID
     */
    public FunDCT_setTemplateUploadLogID(_iTemplateUploadLogID: string) {
        this._iTemplateUploadLogID = _iTemplateUploadLogID;
    }


    /**
     * To get _cUserID
     */
    public FunDCT_getTemplateUserID() {
        return this._cUserID;
    }

    /**
     * To set _cUserID
     */
    public FunDCT_setTemplateUserID(_cUserID: string) {
        this._cUserID = _cUserID;
    }


    /**
     * To get _cValidateTmplateStatusFile
     */
    public FunDCT_getTemplateStatusFile() {
        return this._cValidateTmplateStatusFile;
    }

    /**
     * To set _cValidateTmplateStatusFile
     */
    public FunDCT_setTemplateStatusFile(_cValidateTmplateStatusFile: string) {
        this._cValidateTmplateStatusFile = _cValidateTmplateStatusFile;
    }


    /**
     * To get _cValidateTmplateStatusFile
     */
    public FunDCT_getValidateTemplateResponseFile() {
        return this._cValidatedExcelToJSONSuccessFile;
    }

    /**
     * To set _cValidateTmplateStatusFile
     */
    public FunDCT_setValidateTemplateResponseFile(_cValidatedExcelToJSONSuccessFile: string) {
        this._cValidatedExcelToJSONSuccessFile = _cValidatedExcelToJSONSuccessFile;
    }

    /**
     * To set _cUploadType
     */
    public FunDCT_SetUploadType(_cUploadType: string) {
        this._cUploadType = _cUploadType;
    }

    /**
     * To get _cUploadType
     */
    public FunDCT_GetUploadType() {
        return this._cUploadType;
    }

    /**
     * To set _cCompanyname
     */
    public FunDCT_SetCompanyName(_cCompanyname: string) {
        this._cCompanyname = _cCompanyname;
    }

    /**
     * To get _cCompanyname
     */
    public FunDCT_GetCompanyName() {
        return this._cCompanyname;
    }

    /**
     * added by stewari
     * To Get Cutoff Date 
     * @returns tCuttoffdate
     */
    public FunDCT_GetCuttoffdate() {
        return this.tCuttoffdate.toString();
    }

    /**
     * added by stewari
     * To Set Cutoff Date 
     * @param tCuttoffdate tCuttoffdate
     */
    public FunDCT_SetCuttoffdate(tCuttoffdate: any) {
        this.tCuttoffdate = tCuttoffdate.toString();
    }

    /**
     * To get Fields
     */
    public FunDCT_GetTemplateType() {
        return this.cTemplateType;
    }

    /**
     * To set cTemplateType
     */
    public FunDCT_SetTemplateType(cTemplateType: string) {
        this.cTemplateType = cTemplateType;
    }

    /**
     * To set template details with template meta data
     * @param iTemplateID any
     * @returns Set oTemplateDetails
     */
    public async FunDCT_setTemplateDetails(iTemplateID: any) {
        try {
            this.oTemplateDetails = await Template.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                {
                    $lookup: {
                        from: "gen_statuses",
                        localField: "iStatusID",
                        foreignField: "_id",
                        as: "oTemplateListing"
                    },
                },
                { $unwind: "$oTemplateListing" },
                {
                    $lookup: {
                        from: "tmpl_metadatas",
                        localField: "_id",
                        foreignField: "iTemplateID",
                        as: "oTemplateMetaDataListing"
                    },
                },
                { $unwind: "$oTemplateMetaDataListing" }
            ]);

            this.FunDCT_SetValidationRules(this.oTemplateDetails);

            return this.oTemplateDetails;
        } catch (err) {
            return err;
        }
    }

    /**
     * To get Structurized header array from posted json
     * @param aTemplateHeader any
     */
    public async FunDCT_StructurizedHeader(aTemplateHeader: any) {
        var oHeaderTree = {};
        var iIndexRow = 0;
        return aTemplateHeader.filter(function (oHeaderObj) {
            var cHeaderLabel = oHeaderObj["cHeaderLabel"],
                cParentHeader = oHeaderObj["cParentHeader"];
            oHeaderTree[cHeaderLabel] = _.defaults(oHeaderObj, oHeaderTree[cHeaderLabel], { children: [] });
            cParentHeader && (oHeaderTree[cParentHeader] = (oHeaderTree[cParentHeader] || { children: [] }))["children"].push(oHeaderObj);
            iIndexRow++;
            return !cParentHeader;
        });
    }

    /**
     * To Add Level Last to the Child Header which have no child headers
     * @param items any
     * @param result array
     * @returns array
     */
    public async FunDCT_DefineLevels(items, result: any = []) {
        if (items.length) {
            var item = items.shift();
            result.push(item);

            if (item.children && item.children.length) {
                result = await this.FunDCT_DefineLevels(item.children, result);
            } else {
                item.iLevel = 'Last';
            }

            return await this.FunDCT_DefineLevels(items, result);
        } else {
            return result;
        }
    }

    /**
     * To get headers with specific keys only
     * @param arr any
     * @param propsToKeep any
     */
    public async FunDCT_HeaderSpecificKeys(arr: any, propsToKeep: any) {
        return _.map(arr, function (obj) {
            return _(obj).pick(propsToKeep).mapValues(function (value) {
                return _.isArray(value) ? this.FunDCT_HeaderSpecificKeys(value, propsToKeep) : value;
            });
        });
    }

    public columnIndex(name) {
        let index = 0;

        name = name.toUpperCase().split('');

        for (let i = name.length - 1; i >= 0; i--) {
            let piece = name[i];
            let colNumber = piece.charCodeAt() - 64;
            index = index + colNumber * Number(Math.pow(26, name.length - (i + 1)));
        }

        return index + 65;
    }

    /**
     * To Add Parent Header Label to Children
     * Future Use : To Add Children under its parent header uncomment below commented line will append children to parent
     * 
     * @param aHeaderDetails any
     * @param aObjToArr any
     */
    public async FunDCT_ParentHeaderLabelToChild(aHeaderDetails: any, aObjToArr: any) {
        // const aParentHeader: any = _.filter(aObjToArr, {cParentHeader: ''});
        for (var cKey in aHeaderDetails) {
            if (aHeaderDetails[cKey]['iRow'] > 1 && aHeaderDetails[cKey]['cCellCordinate'] != '-') {
                let cStartRange: string = aHeaderDetails[cKey]['cCellCordinate'];
                let cAlpha = cStartRange.replace(/[^a-z]/gi, '');
                let iActualRow = aHeaderDetails[cKey]['iRow'] - 1;
                let aFilteredHeader: any;

                aFilteredHeader = _.filter(aObjToArr, { iRow: iActualRow, cParentHeader: '', jColumn: aHeaderDetails[cKey]['jColumn'] });
                if (aFilteredHeader.length <= 0) {
                    for (var iIndex = aHeaderDetails[cKey]['jColumn'] - 1, end = 1; iIndex >= end; --iIndex) {
                        aFilteredHeader = _.filter(aObjToArr, { iRow: iActualRow, cParentHeader: '', jColumn: iIndex });
                        if (aFilteredHeader.length > 0) {
                            break;
                        }
                    }
                }

                for (var cKeyFiltered in aFilteredHeader) {
                    let iIndexChildren: number = aHeaderDetails[aFilteredHeader[cKeyFiltered]['iIndex']]['children'].length;
                    aHeaderDetails[cKey]['cParentHeader'] = aHeaderDetails[aFilteredHeader[cKeyFiltered]['iIndex']]['cHeaderLabel'];

                    aHeaderDetails[cKey]['aValidations'] = (typeof aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']] === 'object') ? Object.assign({}, aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']]) : aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']];
                    aHeaderDetails[cKey]['aRowColors'] = aObjToArr[0]['aValidationsColors'][aHeaderDetails[cKey]['cStartRange']];

                    // Future Use if needs to add children to parent
                    //aHeaderDetails[aFilteredHeader[cKeyFiltered]['iIndex']]['children'][iIndexChildren] = aHeaderDetails[cKey];
                    iIndexChildren += 1
                }
            } else {
                aHeaderDetails[cKey]['aValidations'] = (typeof aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']] === 'object') ? Object.assign({}, aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']]) : aObjToArr[0]['aPrimaryValidations'][aHeaderDetails[cKey]['cStartRange']];
                aHeaderDetails[cKey]['aRowColors'] = aObjToArr[0]['aValidationsColors'][aHeaderDetails[cKey]['cStartRange']];
            }
        }

        return aHeaderDetails;
    }


    /**
     * To create sample template file from python script
     * @param oTemplates ITemplate
     * @param oTemplateMetaData ITmplMetaData
     */
    public async FunDCT_createTemplateSampleFile(oTemplates: ITemplate, oTemplateMetaData: ITmplMetaData) {
        try {
            this.FunDCT_setUserID('0001')
            let stream = '/API/CREATE_TEMPLATE/' + oTemplates._id
            this.FunDCT_ApiRequest({ baseUrl: stream })
            const aStructuredHeaderData = await this.FunDCT_StructurizedHeader(oTemplateMetaData.aTemplateHeader);
            if (aStructuredHeaderData) {
                const pickDeep = (arr, propsToKeep) => {
                    const propsToKeepDict = new Set(propsToKeep);
                    const inner = (arr) =>
                        arr.map((obj) =>
                            Object.entries(obj).reduce((result, [key, value]) => {
                                propsToKeepDict.has(key) && (result[key] = Array.isArray(value) ? inner(value) : value);
                                return result;
                            }, {}));
                    return inner(arr);
                }
                const aApplyDeeptoStructure = pickDeep(aStructuredHeaderData, ['cHeaderLabel', 'children']);

                let aAppendDatatoRoot = { "cHeaderLabel": "root", "children": aApplyDeeptoStructure };
                this.cTemplateSampleFile = 'CREATE_TEMPLATE-SAMPLE-' + oTemplates._id;
                let cFileType = '.xlsx';
                let userID = this.FunDCT_getUserID()
                const oParams = {
                    'cDirTemplateSampleFile': this.cDirTemplateSampleFile, 'cTemplateSampleFile': this.cTemplateSampleFile, 'cFileType': cFileType,
                    'iTemplateID': this.FunDCT_getTemplateID(),
                    'cUserID': userID ? userID : '0001',
                    'oTemplateMetaData': oTemplateMetaData,
                    'aAppendDatatoRoot': aAppendDatatoRoot,
                    'cType': stream
                };
                this.log(`${JSON.stringify(oParams)} parameters sending file to createfiles.py`)
                const response = await axios.post(`${this.cBackEndURILocal}api/createfiles`, oParams);
                let oResPyProg = JSON.parse(response.data);
                this.log(`Response fromf create.py Files ${oResPyProg}`)
                return oResPyProg;
            }
        } catch (err) {
            this.error(err.message);
        }
    }

    /**
   * Function added by spirgonde to validate no of rows and other content of uploaded template .  
   * @param path 
   * @returns 
   */
    //   public async FunDCT_ValidateTemplate(formData) {
    //     try {
    //         let oTemplateType = await GenTemplateType.findOne({ cTemplateType: formData.cTemplateType}).lean() as ITemplateType;

    //         let oValidationRule: ITemplateValidation[] = await TemplateValidation.find({cTemplateType: oTemplateType._id}, // removed .toString()
    //         {cValidateRule:1,_id:0});            

    //         let oValidationRuleAll: ITemplateValidation[] = await TemplateValidation.find({});

    //         let aValidateRules = oValidationRule.map(function (obj) {
    //             return obj.cValidateRule;
    //         });

    //         let aValidateRulesAll = oValidationRuleAll.map(function (obj) {
    //             return obj.cValidateRule;
    //         });

    //         let userID =this.FunDCT_getUserID()
    //         const oParams = {
    //             'cFileContent': formData.files[0]?.content,
    //             'aValidateRules': aValidateRules,
    //             'aValidateRulesAll':aValidateRulesAll,
    //             'cUserID':'',
    //             'cType':this.currentStreamName
    //         };
    //         this.log(`ValidateUploadTemplate.py Request ==> ${JSON.stringify(oParams)} `) 
    //         const cScript = this.cDirPythonPath + 'ValidateUploadTemplate.py';
    //         const oPyArgs = [cScript, JSON.stringify(oParams)]
    //         const oParseFile:any = spawn(process.env.PYTHON_PATH, oPyArgs);
    //         console.log("oParseFile=======>",oParseFile);

    //         let oResPyProg: any, error;

    //         oParseFile.stdout.on('data', function (data) {
    //             // oResPyProg = JSON.parse(data.toString('utf8'));
    //             try {
    //                 oResPyProg = JSON.parse(data.toString('utf8'));
    //                 console.log("oResPyProg=======>",oResPyProg);
    //             } catch (error) {
    //                 oResPyProg = undefined;
    //                 console.log("oResPyProgerror=======>",oResPyProg);
    //             }
    //         });
    //         // // oParseFile.stderr.on('data', (data) => {
    //         // //     error = data.toString();
    //         // // });
    //         // oParseFile.stderr.on('error', (data) => {
    //         //     oResPyProg = undefined
    //         // });
    //         // oParseFile.stderr.on('data', (data) => {
    //         //     let bufferData = new BufferReader(data)
    //         //     // let __nBytes = bufferData.restAll()
    //         //     let iLength = bufferData.buf.length
    //         //     let arr=[];
    //         //     for (let index = 1; index < iLength; index++) {
    //         //         try {
    //         //             arr.push(bufferData.nextString(index))
    //         //         } catch (error) {
    //         //             arr.push('')
    //         //         }
    //         //     }
    //         //     this.log(arr.join(''))
    //         //     // oResPyProg += JSON.parse(data.toString('utf8'))
    //         // });
    //         // await once(oParseFile, 'close');
    //         // this.log(`ValidateUploadTemplate.py Respon ==> ${JSON.stringify(oResPyProg)} `) 
    //         // return oResPyProg;

    //     }
    //     catch (err) {
    //         this.log('err'+ err);
    //     }
    // }


    public async FunDCT_ValidateTemplate(formData) {
        try {
            let oTemplateType = await GenTemplateType.findOne({ cTemplateType: formData.cTemplateType }).lean() as ITemplateType;

            let oValidationRule: ITemplateValidation[] = await TemplateValidation.find(
                { cTemplateType: oTemplateType._id },
                { cValidateRule: 1, _id: 0 }
            );

            let oValidationRuleAll: ITemplateValidation[] = await TemplateValidation.find({});

            let aValidateRules = oValidationRule.map((obj) => obj.cValidateRule);
            let aValidateRulesAll = oValidationRuleAll.map((obj) => obj.cValidateRule);
            let aReplaceRegexCodeAsKey = await this.FunDCT_ReplaceMessageCodeAsKey(this._oGetValidationRulesDetails, 'cValidateRule', 'cValidateRegex');

            let userID = this.FunDCT_getUserID();
            const oParams = {
                cFileContent: formData.files[0]?.content,
                aValidateRules,
                aValidateRulesAll,
                _cImportHeaderVaidationRule: JSON.stringify(aReplaceRegexCodeAsKey),
                cUserID: userID,
                cType: this.currentStreamName
            };

            this.log(`ValidateUploadTemplate Request ==> ${JSON.stringify(oParams)}`);

            // Make API call to Python API instead of spawn()
            const response = await axios.post(`${this.cBackEndURILocal}api/validateuploadtemplate`, oParams);

            this.log(`ValidateUploadTemplate Response ==> ${JSON.stringify(response.data)}`);
            return response.data;

        } catch (err) {
            this.log('Error: ' + err);
        }
    }



    /**
     * To Import Header from XLSx, and convert to array using python - openpyxl
     * 
     * @param _cTempFileImportExcelToJSON string
     * @param _cFileTypeImportExcelToJSON string
     */
    public async FunDCT_ExcelToJSON_Converter(oResPyProg: any) {
        try {
            this.log(`ParseFiles.py Response ==> ${JSON.stringify(oResPyProg)} `)
            let aHeaderDetails: any;
            if (oResPyProg.cStatus == 'Success') {
                let oResponseParse = oResPyProg.oResponse
                this.aStructuredHeaderFromExcel = oResponseParse;
                let aObjToArr = _.toArray(oResponseParse);

                aHeaderDetails = await this.FunDCT_ParentHeaderLabelToChild(aObjToArr, aObjToArr);
                let aApplyDeeptoStructure: any;
                if (aHeaderDetails) {
                    const oPickDeep = (arr, propsToKeep) => {
                        const propsToKeepDict = new Set(propsToKeep);
                        const inner = (arr) =>
                            arr.map((obj) =>
                                Object.entries(obj).reduce((result, [key, value]) => {
                                    propsToKeepDict.has(key) && (result[key] = Array.isArray(value) ? inner(value) : value);
                                    return result;
                                }, {}));
                        return inner(arr);
                    }
                    aApplyDeeptoStructure = oPickDeep(aHeaderDetails, ['cHeaderLabel', 'cParentHeader', 'cTextColor', 'cBackColor', 'cValidations', 'cRangeValidations', 'cStartRange', 'cCellCordinate', 'iRow', 'jColumn', 'iMaxRow', 'aValidations', 'aRowColors', 'typeaValidations', 'cComment']);
                }
                if (aApplyDeeptoStructure) {
                    let aApplyDeeptoStructureNew = _.orderBy(aApplyDeeptoStructure, ['jColumn'], ['asc']);
                    aApplyDeeptoStructureNew['cStatus'] = 'Success';
                    return aApplyDeeptoStructureNew;
                }
            } else {
                return oResPyProg;
            }
        } catch (err) {
            this.error(err.message);
            // process.exit(1);
        }
    }


    /**
     * To create new array with Message Code with its description
     * @param oReplaceArr any
     * @returns array
     */
    public async FunDCT_ReplaceMessageCodeAsKey(oReplaceArr: any, cNewKeyToAdd: string, cContentToAdd: string) {
        try {
            let aReplaceArr = {};
            let iIndex = 0;
            for await (let aValidationMessages of oReplaceArr) {
                aReplaceArr[aValidationMessages[cNewKeyToAdd]] = aValidationMessages[cContentToAdd];
            }
            return aReplaceArr;
        } catch (err) {
            this.error(err.message);
            // process.exit(1);
        }
    }

    /**
     * To create new array with Message Code with its description
     * @param oReplaceArr any
     * @returns array
     */
    public async FunDCT_GetPendingTemplateUpload() {
        try {
            this.FunDCT_setUserID('0001')
            this.FunDCT_ApiRequest({ baseUrl: '/API/PENDING_TEMPLATE_UPLOAD/' })
            let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            let oPendingUpload = await TmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 }).limit(1);

            if (oPendingUpload.length <= 0) {
                const oPendingUploadLog = await TmplUploadLog.findOne({ iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N', iActiveStatus: 0 }).lean() as ITmplUploadLog;
                if (oPendingUploadLog) {
                    this.FunDCT_SetUploadType('DISTRIBUTE');
                    //iUpdatedby: 'Pending Template Cron',
                    const aRequestDetails = { bProcesslock: 'Y', tProcessStart: new Date(), tUpdated: new Date() };
                    if (aRequestDetails) {
                        await TmplUploadLog.findOneAndUpdate(
                            { iStatusID: iStatusID, _id: oPendingUploadLog._id, iActiveStatus: 0 },
                            { $set: aRequestDetails },
                            { new: true }
                        );
                    }
                    return oPendingUploadLog;
                } else {
                    let oInProgressMemberUpload = await MemTmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 }).limit(1);
                    if (oInProgressMemberUpload.length <= 0) {
                        const oPendingMemberUpload = await MemTmplUploadLog.findOne({ iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N', iActiveStatus: 0 }).lean() as IMemTmplUploadLog;
                        if (oPendingMemberUpload) {
                            this.FunDCT_SetUploadType(oPendingMemberUpload.cUploadType);
                            //iUpdatedby: 'Pending Template Cron',
                            const aRequestDetails = { bProcesslock: 'Y', tProcessStart: new Date(), tUpdated: new Date() };
                            if (aRequestDetails) {
                                await MemTmplUploadLog.findOneAndUpdate(
                                    { iStatusID: iStatusID, _id: oPendingMemberUpload._id, iActiveStatus: 0 },
                                    { $set: aRequestDetails },
                                    { new: true }
                                );
                            }
                            return oPendingMemberUpload;
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } catch (err) {
            this.error(err.message);
            // process.exit(1);
        }
    }

    /**
     * To create sample template file from python script
     * @param oTemplates ITemplate
     * @param oTemplateMetaData ITmplMetaData
     */
    public async FunDCT_ValidateTemplateHeaderContent() {
        try {
            this.FunDCT_setUserID('0001')
            let stream = `/CRON/VALIDATE_TEMPLATE_CONTENT/`


            const oPendingUpload: any = await this.FunDCT_GetPendingTemplateUpload();
            if (typeof oPendingUpload === 'undefined' || oPendingUpload == false) {
                return "Files In Progress or No Pending Files";
            }

            let iTemplateID = oPendingUpload.iTemplateID;
            stream = stream + iTemplateID
            this.FunDCT_ApiRequest({ baseUrl: stream })
            let tCutoffConverted: any;
            let cTemplateType: any;
            await this.FunDCT_SetCurrentUserDetailsByID(oPendingUpload.iEnteredby);
            let oCurrentUserDetails = await User.findOne({ _id: new mongoose.Types.ObjectId(oPendingUpload.iEnteredby) }).lean() as IUser;
            this.FunDCT_setUserDetails(oCurrentUserDetails);
            if (this._cUploadType == 'DISTRIBUTE') {
                this.FunDCT_SetCompanyName(this.oCurrentUserDetails.cCompanyname);
            } else {
                this.FunDCT_SetCompanyName(oPendingUpload.cScacCode);
            }
            this.FunDCT_setTemplateUploadLogID(oPendingUpload._id);
            this.FunDCT_setTemplateUserID(oPendingUpload.iEnteredby);
            let oTemplate = await Template.findOne({ _id: new mongoose.Types.ObjectId(iTemplateID) }).lean() as ITemplate;
            let oTemplateMetaData = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
            let cAdditionalFieldValue: string = '-';
            let iAdditionalCnfgID: any;
            let oAdditionalConfiguration;
            if (oTemplate && oTemplateMetaData) {
                tCutoffConverted = oTemplateMetaData.tCuttoffdate;
                cTemplateType = oTemplate.cTemplateType;
                if (oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields']) {
                    if (oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields'].length > 0) {
                        iAdditionalCnfgID = oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields'];
                        oAdditionalConfiguration = await Additionalfields.findOne({ _id: new mongoose.Types.ObjectId(iAdditionalCnfgID) }).lean() as IAdditionalFields;
                        cAdditionalFieldValue = oAdditionalConfiguration.cAdditionalFieldValue;
                    }
                }
            }

            this.FunDCT_SetCuttoffdate(tCutoffConverted);//added by stewari
            this.FunDCT_SetTemplateType(cTemplateType);//added by stewari

            if (this._cUploadType == 'DISTRIBUTE') {
                this._cFileTypeUploadTemplate = path.extname(oPendingUpload.cTemplateFile);
                let cFileName = path.parse(oPendingUpload.cTemplateFile).base
                this._cTempFileUploadTemplate = cFileName.split('.').slice(0, -1).join('.');
            } else if (this._cUploadType == 'MEMBER_UPLOAD' || this._cUploadType == 'MEMBER_ADMIN_UPLOAD') {
                this._cFileTypeUploadTemplate = path.extname(oPendingUpload.cTemplateFile);
                let cFileName = path.parse(oPendingUpload.cTemplateFile).base
                this._cTempFileUploadTemplate = cFileName.split('.').slice(0, -1).join('.');
            }

            this.FunDCT_setTempFileUploadTemplate(this._cTempFileUploadTemplate);
            this.FunDCT_setFileTypeUploadTemplate(this._cFileTypeUploadTemplate);
            this.FunDCT_setTemplateID(iTemplateID);

            this._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": this._iTemplateID });//Get Template Meta Data and set to Manage Template
            let oTemplateDetails = await this.FunDCT_setTemplateDetails(this._iTemplateID);//retrive validations
            this._oGetMessageDetailsModules = await Message.find({ "cModuleCode": 'UPLOAD_TEMPLATE' });//retrieve messages

            for await (let aValidationRuleCls of this._oValidationRuleCls) {
                const aStructuredHeaderData = await this.FunDCT_StructurizedHeader(aValidationRuleCls.oTemplateMetaDataListing.aTemplateHeader);
                const aHeaderLevel = await this.FunDCT_DefineLevels(aStructuredHeaderData);
                const cFilterVal = 'Last';
                const aHeadersLast = _.filter(aHeaderLevel, (o) => _.includes(o, cFilterVal));
                const aComments = aHeaderLevel.map(user => _.pick(user, ['cComment']))

                const cFileDir = (this._cUploadType == 'DISTRIBUTE') ? this.cDirTemplateInterTeamUploadTemplate : this.cDirTemplateMemberUploadTemplate
                const cDirTemplateStatusFile = (this._cUploadType == 'DISTRIBUTE') ? this.cDirValidateTemplateStatusFile : this.cDirValidateTemplateStatusFileMember
                const cDirTemplateHeaderLevel = (this._cUploadType == 'DISTRIBUTE') ? this.cDirValidateTemplateHeaderLevel : this.cDirValidateTemplateHeaderLevelMember

                this._cValidateTemplateFileJSON = 'VALIDATE_TEMPLATE-HEADERLEVEL-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json';
                this.FuncDCT_CheckFolderPathExist(cDirTemplateHeaderLevel)
                this.log(`Header Level file location == > ${cDirTemplateHeaderLevel} + ${this._cValidateTemplateFileJSON}`)
                fs.writeFileSync(cDirTemplateHeaderLevel + this._cValidateTemplateFileJSON, JSON.stringify(aHeadersLast),);

                this._cTemplateCommentsFileJSON = 'Comments-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json';
                // this.log(`Comment  file location == > ${cDirTemplateHeaderLevel} + ${this._cTemplateCommentsFileJSON}`)

                fs.writeFileSync(cDirTemplateHeaderLevel + this._cTemplateCommentsFileJSON, JSON.stringify(aComments));

                this.FunDCT_setTemplateStatusFile('VALIDATE_TEMPLATE-STATUSFILE-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.xlsx');
                this.FunDCT_setValidateTemplateResponseFile('VALIDATE_TEMPLATE-RESPONSEFILE-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json');
                let userID = this.FunDCT_getUserID()

                let oTemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType }).lean() as ITemplateType;
                const oParams = {
                    'iTemplateID': iTemplateID,
                    'tCuttoffdate': (this._cUploadType == 'DISTRIBUTE') ? this.FunDCT_GetCuttoffdate() : '0000-00-00',//added by stewari
                    'cFileDir': cFileDir, 'cFileName': this._cTempFileUploadTemplate, 'cFileType': this._cFileTypeUploadTemplate,
                    'cSampleTemplateFileDir': this.cDirTemplateSampleFile, 'cSampleTemplateFile': 'CREATE_TEMPLATE-SAMPLE-' + iTemplateID, 'cSampleFileType': this._cFileTypeUploadTemplate,
                    'cDirValidateTemplateHeaderLevel': cDirTemplateHeaderLevel, '_cValidateTemplateFileJSON': this._cValidateTemplateFileJSON,
                    '_iTemplateUploadLogID': this._iTemplateUploadLogID, '_cValidateTmplateStatusFile': this._cValidateTmplateStatusFile, 'cDirValidateTemplateStatusFile': cDirTemplateStatusFile,
                    'iMaxDepthHeaders': this._oGetTemplateMetaDataDetails[0]['iMaxDepthHeaders'],
                    '_cValidatedExcelToJSONSuccessFile': this._cValidatedExcelToJSONSuccessFile,
                    '_cUploadType': this.FunDCT_GetUploadType(),
                    '_cCompanyname': this.FunDCT_GetCompanyName(),
                    'cDirDistribution': this.cDirDistributionTemplate,
                    'cDirConsolidation': this.cDirConsolidationTemplate,
                    'cTemplateType': this.FunDCT_GetTemplateType(),
                    '_cTemplateCommentsFileJSON': this._cTemplateCommentsFileJSON,
                    'cAdditionalFieldValue': (cAdditionalFieldValue ? cAdditionalFieldValue : '-'),
                    'cUserID': userID ? userID : '0001',
                    'cType': stream,
                    'preFillData': oTemplateType.preFillData,
                    'startHeaderRowIndex': this._oGetTemplateMetaDataDetails[0]['startHeaderRowIndex'],
                };

                if (oTemplateType.preFillData == 'yes' || this._cUploadType !== 'DISTRIBUTE') {
                    this.log(`request ValidateTemplate.py => ${JSON.stringify(oParams)}`)
                    const cScript = this.cDirPythonPath + 'ValidateTemplate.py';
                    const oPyArgs = [cScript, JSON.stringify(oParams)]

                    const oCreateFile: any = spawn(process.env.PYTHON_PATH, oPyArgs);
                    // const oCreateFile = spawn('python', oPyArgs);
                    let oResPyProg: any;
                    oCreateFile.stdout.on('data', function (data) {
                        // oResPyProg = JSON.parse(data.toString('utf8'))
                        try {
                            oResPyProg = JSON.parse(data.toString('utf8'));
                        } catch (error) {
                            oResPyProg = undefined;
                        }
                    });
                    oCreateFile.stderr.on('error', (data) => {
                        oResPyProg = undefined
                    });
                    oCreateFile.stderr.on('data', (data) => {
                        let bufferData = new BufferReader(data)
                        // let __nBytes = bufferData.restAll()
                        let iLength = bufferData.buf.length
                        let arr: any = [];
                        for (let index = 1; index < iLength; index++) {
                            try {
                                arr.push(bufferData.nextString(index))
                            } catch (error) {
                                arr.push('')
                            }
                        }
                        this.log(arr.join(''))
                        // oResPyProg += JSON.parse(data.toString('utf8'))
                    });

                    await once(oCreateFile, 'close');

                    let oResponseParse;
                    let selectedMember;
                    if (oResPyProg.cStatus == 'Success') {
                        let oResponseRead: any = fs.readFileSync(cDirTemplateStatusFile + this._cValidatedExcelToJSONSuccessFile);
                        oResponseParse = JSON.parse(oResponseRead);
                        let bExceptionfound = (oResponseParse.iErrorLenth > 0) ? 'Y' : 'N';
                        const oUpdateUploadLog = (this._cUploadType == 'DISTRIBUTE') ? await this.FunDCT_UpdateTemplateUploadLog(bExceptionfound, oResponseParse, cDirTemplateStatusFile) : await this.FunDCT_UpdateMemberTemplateUploadLog(bExceptionfound, oResponseParse, cDirTemplateStatusFile);
                        if (bExceptionfound == 'N') {
                            let metadataID = oTemplateDetails[0].oTemplateMetaDataListing._id;
                            const aRequestDetail = { iRedistributedIsUploaded: '0' }
                            let oStatData = await TmplMetaData.findByIdAndUpdate(metadataID,
                                { $set: aRequestDetail },
                                { new: true }
                            );
                            oTemplateDetails[0].oTemplateMetaDataListing = oStatData
                            await this.FunDCT_SendUploadStatus(oResponseParse, oTemplateDetails, oResPyProg, cDirTemplateStatusFile, oTemplateMetaData);
                        }
                        else if (bExceptionfound == 'Y') {
                            let aVariablesVal = {
                                // DCTVARIABLE_USERNAME: this.cUsername,
                                DCTVARIABLE_USERNAME: 'User',
                                DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
                                DCTVARIABLE_DISTRIBUTEDFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cStatusFilePath,
                                DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
                            };
                            let oEmailTemplateDetails;
                            var cQueryUsing: any = {};
                            cQueryUsing["cEmailType"] = 'UPLOAD_TEMPLATE_EXCEPTION_FOUND';
                            this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
                            this._oEmailTemplateCls.FunDCT_SetCc(oTemplateMetaData.cEmailFrom);
                            oEmailTemplateDetails = await GenEmailtemplates.find(cQueryUsing);
                            if (oEmailTemplateDetails) {
                                // this._oEmailTemplateCls.FunDCT_SetEmailTemplateID(oEmailTemplateDetails[0]._id)
                                this._oEmailTemplateCls.FunDCT_SetEmailTemplateID('');
                            }
                            this._oEmailTemplateCls.FunDCT_SetSubject(oEmailTemplateDetails[0].cSubject + " " + aVariablesVal.DCTVARIABLE_TEMPLATENAME)
                            await this._oEmailTemplateCls.FunDCT_SendNotification('UPLOAD_TEMPLATE', 'UPLOAD_TEMPLATE_EXCEPTION_FOUND', aVariablesVal, this.cEmail);

                        }
                    }

                    // await this.FunDCT_SendUploadStatus(oResponseParse, oTemplateDetails, oResPyProg, cDirTemplateStatusFile, oTemplateMetaData);
                }
                else {
                    let oResponseParse;
                    let selectedMember;
                    let selectedMembersDataList: any = [];
                    let oMemberEmailAndScac: any = [];
                    let cDistributionDetails: any = {};
                    // let oResponseRead: any = fs.readFileSync(uploadFilePath); //Read uploaded template file from C:\VAR\TEMP\assets\templates\uploadtemplate\interteam.
                    // let oResponseFile = xlsx.readFile(uploadFilePath);
                    let type = "prefilledno";
                    let uploadFilePath = oParams.cFileDir + oParams.cFileName + oParams.cFileType;
                    let fullUploadPath = await this._oCommonCls.FunDCT_UploadS3File(uploadFilePath, type);//upload & return file path for status file.

                    let oTmplUploadLog = await TmplUploadLog.findOne({ _id: this._iTemplateUploadLogID, iActiveStatus: 0 }).lean() as ITmplUploadLog;
                    if (oTmplUploadLog) {
                        selectedMember = oTmplUploadLog.cSelectedMembers
                        for (let scacCode of selectedMember) {
                            let oMembersList = await GenMember.findOne({ cScac: scacCode }).lean() as IMember;
                            if (oMembersList) {
                                selectedMembersDataList.push(oMembersList);
                                let cEmail = oMembersList['_doc'].cEmail;
                                let newArray = { cEmail, scacCode };
                                oMemberEmailAndScac.push(newArray);

                                // let data = "aMemberCutoffs." + scacCode + ".0.tCuttoffdate";
                                // let data2 = "aMappedScacColumnsStat." + scacCode;
                                let data = `aMemberCutoffs.${scacCode}`;
                                let data2 = `aMappedScacColumnsStat.${scacCode}`;
                                let oTemplateMetaData = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
                                const aRequestDetails = {
                                    [data]: [{ tCuttoffdate: oTemplateMetaData.tCuttoffdate }],
                                    aDistributedData: "",
                                    [data2]: [{ PreFilledNo: { iSubmittedLanes: 0, iTotalLanes: 0 } }]
                                };

                                // const aRequestDetails = { [data]: oTemplateMetaData.tCuttoffdate, aDistributedData:"", [data2]: {"iSubmittedLanes":0,"iTotalLanes":0} };
                                let oStatData = await TmplMetaData.findByIdAndUpdate(oTemplateMetaData._id,
                                    { $set: aRequestDetails },
                                    { new: true }
                                );

                                //Upload and return file,path for member distribution.
                                const s3ClientClass = new S3ClientClass();
                                let key = "templates/uploadtemplate/interteam/validate_template_statusfile";
                                var params = {
                                    Bucket: this.cAWSBucket,
                                    Key: this.cAWSBucketEnv + '/' + key + '/' + scacCode + '_' + iTemplateID + '.xlsx',
                                    Body: fs.readFileSync(uploadFilePath),
                                    ContentType: oMimeType.lookup(uploadFilePath)
                                };
                                let cSignedURL = await s3ClientClass.put(params);
                                const s3Clientdownload = new S3ClientClass();
                                s3ClientClass.setStreamName(this.currentStreamName)
                                let cUrl = this.cAWSBucketEnv + '/' + key + '/' + scacCode + '_' + iTemplateID + '.xlsx';
                                let oDataStream: any = await s3Clientdownload.get(cUrl)
                                this.FuncDCT_CheckFolderPathExist(this.cDirTemplatesPath)
                                fs.writeFileSync(this.cDirTemplatesPath + 'test.zip', oDataStream);
                                let memberFilePath = this.cAWSBucketEnv + '/' + key + '/' + scacCode + '_' + iTemplateID + '.xlsx';

                                // Determine the next available key
                                let nextKey = Object.keys(cDistributionDetails).length + 1;
                                // Dynamically add to cDistributionDetails
                                cDistributionDetails[nextKey] = {
                                    cDistScaccode: scacCode,
                                    cMemberDistributionFilePath: memberFilePath,
                                    cMemberEmail: cEmail
                                };
                            }
                        }
                    }

                    // Combine all data into one response object
                    oResponseParse = {
                        aValidateContent: {},
                        cDistributionDetails: cDistributionDetails,
                        cFileDir: oParams.cFileDir,
                        cFileName: oParams.cFileName,
                        cFileType: oParams.cFileType,
                        cFullPath: fullUploadPath,
                        cStatusFilePath: fullUploadPath,
                        iMaxDepthHeaders: oParams.iMaxDepthHeaders,
                        iErrorLenth: 0

                    };

                    // let selectedMember;
                    let oResPyProg = {
                        'cStatus': 'Success',
                    };
                    if (oResPyProg.cStatus == 'Success') {
                        //     let oResponseRead: any = fs.readFileSync(cDirTemplateStatusFile + this._cValidatedExcelToJSONSuccessFile);
                        //     oResponseParse  = JSON.parse(oResponseRead);
                        let bExceptionfound = (oResponseParse.iErrorLenth > 0) ? 'Y' : 'N';
                        const oUpdateUploadLog = (this._cUploadType == 'DISTRIBUTE') ? await this.FunDCT_UpdateTemplateUploadLog(bExceptionfound, oResponseParse, cDirTemplateStatusFile) : await this.FunDCT_UpdateMemberTemplateUploadLog(bExceptionfound, oResponseParse, cDirTemplateStatusFile);
                    }

                    await this.FunDCT_SendUploadStatus(oResponseParse, oTemplateDetails, oResPyProg, cDirTemplateStatusFile, oTemplateMetaData);
                }
            }
        } catch (oErr) {
            // const oUpdateUploadLog = (this._cUploadType == 'DISTRIBUTE') ? 'TemplateUploadLog' : 'MemberTemplateUploadLog';
            if (this._cUploadType == 'DISTRIBUTE') {
                let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                if (!oStatus) {
                    return [];
                }
                let iStatusID = oStatus._id;
                let oPendingConslReq = await TmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 });
                const aRequestDetails = { bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
                // this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
                let data = await TmplUploadLog.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']), iActiveStatus: 0 },
                    { $set: aRequestDetails },
                    { new: true }
                );
            }
            if (this._cUploadType !== 'DISTRIBUTE') {
                let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                if (!oStatus) {
                    return [];
                }
                let iStatusID = oStatus._id;
                let oPendingConslReq = await MemTmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 });
                const aRequestDetails = { bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
                // this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
                let data = await MemTmplUploadLog.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']), iActiveStatus: 0 },
                    { $set: aRequestDetails },
                    { new: true }
                );
            }

            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }

    public delay(t) {
        return new Promise(resolve => setTimeout(resolve, t));
    }

    public async FunDCT_SendUploadStatus(oResponseParse, oTemplateDetails, oResPyProg, cDirTemplateStatusFile, oTemplateMetaData) {
        this.FunDCT_setUserID('0001')
        this.FunDCT_ApiRequest({ baseUrl: '/API/SEND_UPLOAD_STATUS/' })
        if (oResPyProg.cStatus == 'Success') {

            // if (this._cUploadType == 'DISTRIBUTE') {
            //     let aVariablesVal = {
            //         DCTVARIABLE_USERNAME: this.cUsername,
            //         DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
            //         DCTVARIABLE_DISTRIBUTEDFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cStatusFilePath,
            //         DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
            //     };

            //     if (oTemplateMetaData.cAdditionalEmail && oTemplateMetaData.cAdditionalEmail!="null") {
            //         aVariablesVal.DCTVARIABLE_USERNAME = 'User';
            //         const emailArray = oTemplateMetaData.cAdditionalEmail.split(',').map(email => email.trim());
            //         for (const email of emailArray) {
            //             await this._oEmailTemplateCls.FunDCT_SendNotification('UPLOAD_TEMPLATE', 'UPLOAD_TEMPLATE_ADDITIONAL_EMAIL', aVariablesVal, email);
            //         }                        
            //     }
            //     aVariablesVal.DCTVARIABLE_USERNAME = this.cUsername;
            //     let oTmplUploadLog: ITmplUploadLog = await TmplUploadLog.findOne({ _id: this._iTemplateUploadLogID });
            //     let selectedMember;
            //     if(oTmplUploadLog){
            //         selectedMember = oTmplUploadLog.cSelectedMembers
            //     }
            //     this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
            //     if(oTemplateMetaData.cEmailFrom != '') {
            //         this._oEmailTemplateCls.FunDCT_SetFrom(oTemplateMetaData.cEmailFrom)
            //     }
            //     if(oTemplateMetaData.cEmailSubject != '') {
            //         this._oEmailTemplateCls.FunDCT_SetSubject(oTemplateMetaData.cEmailSubject)
            //     } else {
            //         this._oEmailTemplateCls.FunDCT_SetSubject('')
            //     }

            //     const aUploadTemplateEmail = this._oEmailTemplateCls.FunDCT_SendNotification('UPLOAD_TEMPLATE', 'UPLOAD_TEMPLATE', aVariablesVal, this.cEmail)

            //     if(aUploadTemplateEmail) {
            //         this._oEmailTemplateCls.FunDCT_SetEmailTemplateID(oTemplateMetaData.cEmailTemplateID)
            //         if (Object.keys(oResponseParse.cDistributionDetails).length > 0 && Object.keys(oResponseParse.iErrorLenth).length <= 0) {
            //             Object.keys(oResponseParse.cDistributionDetails).forEach(async (cKey) => {
            //                 if(selectedMember.length > 0){
            //                     if(selectedMember.includes(oResponseParse.cDistributionDetails[cKey].cDistScaccode)){
            //                         const aVariablesVal = {
            //                             DCTVARIABLE_USERNAME: oResponseParse.cDistributionDetails[cKey].cDistScaccode,
            //                             DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
            //                             DCTVARIABLE_DISTRIBUTEDFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cDistributionDetails[cKey].cMemberDistributionFilePath,
            //                             DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
            //                         };
            //                         this.log("Path>>>>>: "+aVariablesVal.DCTVARIABLE_DISTRIBUTEDFILE);
            //                         this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
            //                         if(oTemplateMetaData.cEmailFrom != '') {
            //                             this._oEmailTemplateCls.FunDCT_SetFrom(oTemplateMetaData.cEmailFrom)
            //                         }
            //                         if(oTemplateMetaData.cEmailSubject != '') {
            //                             this._oEmailTemplateCls.FunDCT_SetSubject(oTemplateMetaData.cEmailSubject)
            //                         }
            //                         await this._oEmailTemplateCls.FunDCT_SendNotification('DISTRIBUTE_TEMPLATE', 'DISTRIBUTE_TEMPLATE', aVariablesVal, oResponseParse.cDistributionDetails[cKey].cMemberEmail)
            //                         await this.delay(50000);

            //                     }        
            //                 }else{
            //                     const aVariablesVal = {
            //                         DCTVARIABLE_USERNAME: oResponseParse.cDistributionDetails[cKey].cDistScaccode,
            //                         DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
            //                         DCTVARIABLE_DISTRIBUTEDFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cDistributionDetails[cKey].cMemberDistributionFilePath,
            //                         DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
            //                     };
            //                     this.log("Path>>>>>: "+aVariablesVal.DCTVARIABLE_DISTRIBUTEDFILE);
            //                     this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
            //                     if(oTemplateMetaData.cEmailFrom != '') {
            //                         this._oEmailTemplateCls.FunDCT_SetFrom(oTemplateMetaData.cEmailFrom)
            //                     }
            //                     if(oTemplateMetaData.cEmailSubject != '') {
            //                         this._oEmailTemplateCls.FunDCT_SetSubject(oTemplateMetaData.cEmailSubject)
            //                     }
            //                     await this._oEmailTemplateCls.FunDCT_SendNotification('DISTRIBUTE_TEMPLATE', 'DISTRIBUTE_TEMPLATE', aVariablesVal, oResponseParse.cDistributionDetails[cKey].cMemberEmail)
            //                     await this.delay(50000);

            //                 }
            //             });
            //         }
            //     }
            // } 
            if (this._cUploadType == 'DISTRIBUTE') {
                let ccEmailArray: any = []; // cc array
                let sendToEmailArray: any = []; // cc array
                ccEmailArray.push(this.cEmail) //current login user's email add in cc array

                let aVariablesVal = {
                    DCTVARIABLE_USERNAME: 'User',
                    DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
                    DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
                };

                //Additional Email  if exists
                if (oTemplateMetaData.cAdditionalEmail && oTemplateMetaData.cAdditionalEmail != "null") {
                    const emailArray = oTemplateMetaData.cAdditionalEmail.split(',').map(email => email.trim());
                    for (const email of emailArray) {
                        ccEmailArray.push(email);  // Additional Email add in cc array one by one.
                    }
                }

                let oTmplUploadLog = await TmplUploadLog.findOne({ _id: this._iTemplateUploadLogID }).lean() as ITmplUploadLog;
                if (oTmplUploadLog.iActiveStatus == -1) {
                    await TmplUploadLog.updateOne(
                        { _id: oTmplUploadLog._id },
                        { $set: { iActiveStatus: -1, bExceptionfound: 'Y', bProcesslock: 'N', bProcessed: 'F' } }
                    );

                    await TmplMetaData.updateOne(
                        { iTemplateID: oTmplUploadLog.iTemplateID },
                        { $set: { iRedistributedIsUploaded: "1" } }
                    );

                    return;
                }

                let selectedMember;
                if (oTmplUploadLog) {
                    selectedMember = oTmplUploadLog.cSelectedMembers
                }
                this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
                if (oTemplateMetaData.cEmailFrom != '') {
                    this._oEmailTemplateCls.FunDCT_SetFrom(oTemplateMetaData.cEmailFrom)
                    ccEmailArray.push(oTemplateMetaData.cEmailFrom) // selected cEmailFrom Email add in cc array
                }
                if (oTemplateMetaData.cEmailSubject != '') {
                    this._oEmailTemplateCls.FunDCT_SetSubject(oTemplateMetaData.cEmailSubject)
                } else {
                    this._oEmailTemplateCls.FunDCT_SetSubject('')
                }
                this._oEmailTemplateCls.FunDCT_SetCc(ccEmailArray);

                this._oEmailTemplateCls.FunDCT_SetEmailTemplateID(oTemplateMetaData.cEmailTemplateID)
                if (Object.keys(oResponseParse.cDistributionDetails).length > 0 && Object.keys(oResponseParse.iErrorLenth).length <= 0) {
                    Object.keys(oResponseParse.cDistributionDetails).forEach(async (cKey) => {
                        if (selectedMember && selectedMember.length > 0) {
                            if (selectedMember.includes(oResponseParse.cDistributionDetails[cKey].cDistScaccode)) {
                                sendToEmailArray.push(oResponseParse.cDistributionDetails[cKey].cMemberEmail);
                            }
                        } else {
                            sendToEmailArray.push(oResponseParse.cDistributionDetails[cKey].cMemberEmail);
                        }
                    });
                }

                const aUploadTemplateEmail = this._oEmailTemplateCls.FunDCT_SendNotification('UPLOAD_TEMPLATE', 'UPLOAD_TEMPLATE', aVariablesVal, sendToEmailArray);
                await this.delay(50000);

            } else if (this._cUploadType == 'MEMBER_UPLOAD') {
                let memberEmail;
                if (oResponseParse.cDistributionDetails && oResponseParse.cDistributionDetails[1]) {
                    memberEmail = oResponseParse.cDistributionDetails[1].cMemberEmail;
                    this._oEmailTemplateCls.FunDCT_SetCc(memberEmail);
                } else {
                    this._oEmailTemplateCls.FunDCT_SetCc('');
                }
                this._oEmailTemplateCls.FunDCT_SetSubject('');
                let objEmailTemplateID = this._oEmailTemplateCls.FunDCT_SetEmailTemplateID('');
                if (objEmailTemplateID == '') {
                    let rateExtension
                    if (this.isRateExtendMode == 'true') {
                        rateExtension = 'Rates Extension';
                    } else rateExtension = ''
                    const aVariablesVal = {
                        DCTVARIABLE_RATE_EXTENSION: rateExtension,
                        DCTVARIABLE_USERNAME: this.cUsername,
                        DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
                        DCTVARIABLE_STATUSFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cStatusFilePath,
                        // DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
                    };
                    if (typeof oResponseParse.aValidateContent === 'object' && oResponseParse.aValidateContent !== null) {
                        if (Object.keys(oResponseParse.aValidateContent).length > 0) {
                            let errorSubject = `Centrix Errors in ${aVariablesVal.DCTVARIABLE_TEMPLATENAME}`
                            this._oEmailTemplateCls.FunDCT_SetSubject(errorSubject)
                            await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member_Template_Upload_Error', aVariablesVal, this.cEmail)
                        } else {
                            let successSubject = `Centrix Success in ${aVariablesVal.DCTVARIABLE_TEMPLATENAME}`
                            this._oEmailTemplateCls.FunDCT_SetSubject(successSubject)
                            await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member Template Uploaded', aVariablesVal, this.cEmail)
                        }
                    }
                    else {
                        await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member Template Uploaded', aVariablesVal, this.cEmail)
                    }
                }
            } else if (this._cUploadType == 'MEMBER_ADMIN_UPLOAD') {
                let memberEmail;
                if (oResponseParse.cDistributionDetails && oResponseParse.cDistributionDetails[1]) {
                    memberEmail = oResponseParse.cDistributionDetails[1].cMemberEmail;
                    this._oEmailTemplateCls.FunDCT_SetCc(memberEmail);
                } else {
                    this._oEmailTemplateCls.FunDCT_SetCc('');
                }
                this._oEmailTemplateCls.FunDCT_SetSubject('');
                let objEmailTemplateID = this._oEmailTemplateCls.FunDCT_SetEmailTemplateID('');
                if (objEmailTemplateID == '') {
                    let rateExtension
                    if (this.isRateExtendMode == 'true') {
                        rateExtension = 'Rates Extension';
                    } else rateExtension = ''
                    const aVariablesVal = {
                        DCTVARIABLE_RATE_EXTENSION: rateExtension,
                        DCTVARIABLE_USERNAME: this.cUsername,
                        DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
                        DCTVARIABLE_STATUSFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cStatusFilePath,
                        // DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
                    };
                    if (typeof oResponseParse.aValidateContent === 'object' && oResponseParse.aValidateContent !== null) {
                        if (Object.keys(oResponseParse.aValidateContent).length > 0) {
                            let errorSubject = `Centrix Errors in ${aVariablesVal.DCTVARIABLE_TEMPLATENAME}`
                            this._oEmailTemplateCls.FunDCT_SetSubject(errorSubject)
                            await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member_Template_Upload_Error', aVariablesVal, this.cEmail)
                        } else {
                            let successSubject = `Centrix Success in ${aVariablesVal.DCTVARIABLE_TEMPLATENAME}`
                            this._oEmailTemplateCls.FunDCT_SetSubject(successSubject)
                            await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member Template Uploaded', aVariablesVal, this.cEmail)
                        }
                    }
                    else {
                        await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member Template Uploaded', aVariablesVal, this.cEmail)
                    }
                    // await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'Member Template Uploaded', aVariablesVal, this.cEmail)
                }
            }
        } else {
            const oUpdateUploadLog = (this._cUploadType == 'DISTRIBUTE') ? await this.FunDCT_UpdateTemplateUploadLog('Y', [], cDirTemplateStatusFile) : await this.FunDCT_UpdateTemplateUploadLog('Y', [], cDirTemplateStatusFile);
            if (this._cUploadType == 'DISTRIBUTE') {
                var aVariablesVal = {
                    // DCTVARIABLE_USERNAME: this.cUsername,
                    DCTVARIABLE_USERNAME: 'User',
                    DCTVARIABLE_TEMPLATENAME: oTemplateDetails[0].cTemplateName,
                    // DCTVARIABLE_STATUSFILE: this.cFrontEndURILocal + "sessions/s3download?downloadpath=" + oResponseParse.cStatusFilePath,
                    DCTVARIABLE_ADDITIONALEMAILBODY: oTemplateMetaData.cEmailText,
                };
                await this._oEmailTemplateCls.FunDCT_SendNotification('UPLOAD_TEMPLATE', 'Template Uploaded', aVariablesVal, this.cEmail)
            }
        }
    }

    /**
     * To Update tmpl_uploadlog
     * @param bExceptionfound any
     * @param cExceptiondetails any
     * @param cDistributionDetails any
     */
    public async FunDCT_UpdateTemplateUploadLog(bExceptionfound: any, oResponseParse: any, cDirTemplateStatusFile: string) {
        try {
            const aTmplUploadLogFields = {
                'bExceptionfound': bExceptionfound,
                'bProcesslock': 'N',
                'bProcessed': 'Y',
                cTemplateFile: oResponseParse.cFullPath,
                // cExceptionDetails: oResponseParse.aValidateContent,
                cDistributionDetails: oResponseParse.cDistributionDetails,
                // cTemplateStatusFile : oResponseParse.cS3UrlStatusFile,
                cTemplateStatusFile: oResponseParse.cStatusFilePath,
                iUpdatedby: this._cUserID,
                tProcessEnd: new Date(),
                tUpdated: new Date(),
                iMaxDepthHeaders: oResponseParse.iMaxDepthHeaders
            };
            let oTmplUploadLog = await TmplUploadLog.findOne({ _id: new mongoose.Types.ObjectId(this._iTemplateUploadLogID), iActiveStatus: 0 }).lean() as ITmplUploadLog;
            if (oTmplUploadLog) {
                let iTemplateID = oTmplUploadLog.iTemplateID

                const recordsList = await TmplUploadLog
                    .find(
                        { iTemplateID, bExceptionfound: 'N', bProcesslock: 'N', bProcessed: 'Y', iActiveStatus: 0, cExceptionDetails: '{}' },
                        { iTemplateID: 1, cDistributionDetails: 1, cTemplateName: 1 }, // Include only `cDistributionDetails` in the result
                    )
                    .sort({ _id: -1 })
                    .exec();

                // Extract cDistributionDetails from recordsList
                const existingDistributionDetails = recordsList.reduce((acc, record) => {
                    const distributionDetails = record.cDistributionDetails || {};
                    Object.keys(distributionDetails).forEach((key) => {
                        acc[distributionDetails[key].cDistScaccode] = distributionDetails[key];
                    });
                    return acc;
                }, {});

                const newDistributionDetails = oResponseParse.cDistributionDetails || {};

                // Compare and add unmatched records to oResponseParse.cDistributionDetails
                Object.keys(newDistributionDetails).forEach((key) => {
                    const newRecord = newDistributionDetails[key];
                    const scacCode = newRecord.cDistScaccode;

                    // Add only if not found in existingDistributionDetails
                    if (!existingDistributionDetails[scacCode]) {
                        existingDistributionDetails[scacCode] = newRecord;
                    }
                });

                aTmplUploadLogFields.cDistributionDetails = existingDistributionDetails;


                oTmplUploadLog = await TmplUploadLog.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(this._iTemplateUploadLogID), iActiveStatus: 0 },
                    { $set: aTmplUploadLogFields },
                    { new: true }
                ).lean() as ITmplUploadLog;
            }
        } catch (oErr) {
            // let oStatus: IStatus = await Status.findOne({ cStatusCode: 'ACTIVE' });
            // if (!oStatus) {
            //     return [];
            // }
            // let iStatusID = oStatus._id;
            // let oPendingConslReq = await TmplUploadLog.find({iStatusID: iStatusID, bProcesslock: 'Y'});
            // const aRequestDetails = { bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
            // // this.FunDCT_SetTemplateID(oPendingConslReq[0]['iTemplateID']);
            // let data = await TmplUploadLog.findOneAndUpdate(
            //     { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']) },
            //     { $set: aRequestDetails },
            //     { new: true }
            // );

            this._oCommonCls.error(oErr.message);
        }
    }

    /**
     * To Update tmpl_uploadlog
     * @param bExceptionfound any
     * @param cExceptiondetails any
     * @param cDirTemplateStatusFile string
     */
    public async FunDCT_UpdateMemberTemplateUploadLog(bExceptionfound: string, oResponseParse: any, cDirTemplateStatusFile: string) {
        try {
            this.FunDCT_setUserID('0001')
            let stream = '/CRON/MEMBER_TEMPLATE_UPLOAD/'
            this.FunDCT_ApiRequest({ baseUrl: stream })
            const abc = JSON.stringify(oResponseParse.aValidateContent)
            const abcnew = JSON.parse(abc)
            const aTmplUploadLogFields = {
                // 'bExceptionfound': bExceptionfound,
                'bProcesslock': 'N',
                'bProcessed': 'Y',
                cTemplateFile: oResponseParse.cFullPath,
                // cExceptionDetails: oResponseParse.aValidateContent,
                // cTemplateStatusFile : oResponseParse.cS3UrlStatusFile,
                cTemplateStatusFile: oResponseParse.cStatusFilePath,
                iUpdatedby: this._cUserID,
                tProcessEnd: new Date(),
                tUpdated: new Date(),
            };
            let oTmplUploadLog = await MemTmplUploadLog.findOne({ _id: new mongoose.Types.ObjectId(this._iTemplateUploadLogID), iActiveStatus: 0 }).lean() as IMemTmplUploadLog;
            if (oTmplUploadLog) {
                this.isRateExtendMode = oTmplUploadLog['_doc']?.isRateExtendMode;
                oTmplUploadLog = await MemTmplUploadLog.findOneAndUpdate(
                    { _id: new mongoose.Types.ObjectId(this._iTemplateUploadLogID), iActiveStatus: 0 },
                    { $set: aTmplUploadLogFields },
                    { new: true }
                ).lean() as IMemTmplUploadLog;
            }
        } catch (oErr) {
            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }



    public getJDumpDetails = async (iTemplateTypeID: any, tmplUploadLogId) => {
        try {
            this.FunDCT_setUserID('0001')
            let stream = `/CRON/VALIDATE_TEMPLATE_CONTENT/`
            const oPendingUpload: any = await this.getTemplateUpload(tmplUploadLogId);
            if (typeof oPendingUpload === 'undefined' || oPendingUpload == false) {
                return "Files In Progress or No Pending Files";
            }
            let iTemplateID = oPendingUpload.iTemplateID;
            stream = stream + iTemplateID
            this.FunDCT_ApiRequest({ baseUrl: stream })
            let tCutoffConverted: any;
            let cTemplateType: any;
            await this.FunDCT_SetCurrentUserDetailsByID(oPendingUpload.iEnteredby);
            let oCurrentUserDetails = await User.findOne({ _id: new mongoose.Types.ObjectId(oPendingUpload.iEnteredby) }).lean() as IUser;
            this.FunDCT_setUserDetails(oCurrentUserDetails);
            if (this._cUploadType == 'DISTRIBUTE') {
                this.FunDCT_SetCompanyName(this.oCurrentUserDetails.cCompanyname);
            } else {
                this.FunDCT_SetCompanyName(oPendingUpload.cScacCode);
            }
            this.FunDCT_setTemplateUploadLogID(oPendingUpload._id);
            this.FunDCT_setTemplateUserID(oPendingUpload.iEnteredby);
            let oTemplate = await Template.findOne({ _id: new mongoose.Types.ObjectId(iTemplateID) }).lean() as ITemplate;
            let oTemplateMetaData = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
            let cAdditionalFieldValue: string = '-';
            let iAdditionalCnfgID: any;
            let oAdditionalConfiguration;
            if (oTemplate && oTemplateMetaData) {
                tCutoffConverted = oTemplateMetaData.tCuttoffdate;
                cTemplateType = oTemplate.cTemplateType;
                if (oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields']) {
                    if (oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields'].length > 0) {
                        iAdditionalCnfgID = oTemplateMetaData.aAdditionalConfiguration[0]['cAdditionalFields'];
                        oAdditionalConfiguration = await Additionalfields.findOne({ _id: new mongoose.Types.ObjectId(iAdditionalCnfgID) }).lean() as IAdditionalFields;
                        cAdditionalFieldValue = oAdditionalConfiguration.cAdditionalFieldValue;
                    }
                }
            }

            this.FunDCT_SetCuttoffdate(tCutoffConverted);//added by stewari
            this.FunDCT_SetTemplateType(cTemplateType);//added by stewari

            if (this._cUploadType == 'DISTRIBUTE') {
                this._cFileTypeUploadTemplate = path.extname(oPendingUpload.cTemplateFile);
                let cFileName = path.parse(oPendingUpload.cTemplateFile).base
                this._cTempFileUploadTemplate = cFileName.split('.').slice(0, -1).join('.');
            } else if (this._cUploadType == 'MEMBER_UPLOAD' || this._cUploadType == 'MEMBER_ADMIN_UPLOAD') {
                this._cFileTypeUploadTemplate = path.extname(oPendingUpload.cTemplateFile);
                let cFileName = path.parse(oPendingUpload.cTemplateFile).base
                this._cTempFileUploadTemplate = cFileName.split('.').slice(0, -1).join('.');
            }

            this.FunDCT_setTempFileUploadTemplate(this._cTempFileUploadTemplate);
            this.FunDCT_setFileTypeUploadTemplate(this._cFileTypeUploadTemplate);
            this.FunDCT_setTemplateID(iTemplateID);

            this._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": this._iTemplateID });//Get Template Meta Data and set to Manage Template
            let oTemplateDetails = await this.FunDCT_setTemplateDetails(this._iTemplateID);//retrive validations
            this._oGetMessageDetailsModules = await Message.find({ "cModuleCode": 'UPLOAD_TEMPLATE' });//retrieve messages

            const laneSchedule: any = [];
            for await (let aValidationRuleCls of this._oValidationRuleCls) {
                const aStructuredHeaderData = await this.FunDCT_StructurizedHeader(aValidationRuleCls.oTemplateMetaDataListing.aTemplateHeader);
                const aHeaderLevel = await this.FunDCT_DefineLevels(aStructuredHeaderData);
                const cFilterVal = 'Last';
                const aHeadersLast = _.filter(aHeaderLevel, (o) => _.includes(o, cFilterVal));
                const aComments = aHeaderLevel.map(user => _.pick(user, ['cComment']))

                const cFileDir = (this._cUploadType == 'DISTRIBUTE') ? this.cDirTemplateInterTeamUploadTemplate : this.cDirTemplateMemberUploadTemplate
                const cDirTemplateStatusFile = (this._cUploadType == 'DISTRIBUTE') ? this.cDirValidateTemplateStatusFile : this.cDirValidateTemplateStatusFileMember
                const cDirTemplateHeaderLevel = (this._cUploadType == 'DISTRIBUTE') ? this.cDirValidateTemplateHeaderLevel : this.cDirValidateTemplateHeaderLevelMember

                this._cValidateTemplateFileJSON = 'VALIDATE_TEMPLATE-HEADERLEVEL-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json';
                // this.FuncDCT_CheckFolderPathExist(cDirTemplateHeaderLevel)
                // this.log(`Header Level file location == > ${cDirTemplateHeaderLevel} + ${this._cValidateTemplateFileJSON}`)
                // fs.writeFileSync(cDirTemplateHeaderLevel + this._cValidateTemplateFileJSON, JSON.stringify(aHeadersLast),);

                this._cTemplateCommentsFileJSON = 'Comments-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json';
                // this.log(`Comment  file location == > ${cDirTemplateHeaderLevel} + ${this._cTemplateCommentsFileJSON}`)

                // fs.writeFileSync(cDirTemplateHeaderLevel + this._cTemplateCommentsFileJSON, JSON.stringify(aComments));

                this.FunDCT_setTemplateStatusFile('VALIDATE_TEMPLATE-STATUSFILE-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.xlsx');
                this.FunDCT_setValidateTemplateResponseFile('VALIDATE_TEMPLATE-RESPONSEFILE-' + iTemplateID + '-' + this._iTemplateUploadLogID + '-' + this._cUserID + '-' + Date.now() + '.json');
                let userID = this.FunDCT_getUserID()

                let oTemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType }).lean() as ITemplateType;
                const oParams = {
                    iTemplateID: iTemplateID,
                    tCuttoffdate: (this._cUploadType == 'DISTRIBUTE') ? this.FunDCT_GetCuttoffdate() : '0000-00-00',//added by stewari
                    cFileDir: cFileDir, cFileName: this._cTempFileUploadTemplate, cFileType: this._cFileTypeUploadTemplate,
                    cSampleTemplateFileDir: this.cDirTemplateSampleFile, cSampleTemplateFile: 'CREATE_TEMPLATE-SAMPLE-' + iTemplateID, cSampleFileType: this._cFileTypeUploadTemplate,
                    cDirValidateTemplateHeaderLevel: cDirTemplateHeaderLevel, _cValidateTemplateFileJSON: aHeadersLast,
                    _iTemplateUploadLogID: this._iTemplateUploadLogID, _cValidateTmplateStatusFile: this._cValidateTmplateStatusFile, cDirValidateTemplateStatusFile: cDirTemplateStatusFile,
                    iMaxDepthHeaders: this._oGetTemplateMetaDataDetails[0]['iMaxDepthHeaders'],
                    _cValidatedExcelToJSONSuccessFile: this._cValidatedExcelToJSONSuccessFile,
                    _cUploadType: this.FunDCT_GetUploadType(),
                    _cCompanyname: this.FunDCT_GetCompanyName(),
                    cDirDistribution: this.cDirDistributionTemplate,
                    cDirConsolidation: this.cDirConsolidationTemplate,
                    cTemplateType: this.FunDCT_GetTemplateType(),
                    _cTemplateCommentsFileJSON: aComments,
                    cAdditionalFieldValue: (cAdditionalFieldValue ? cAdditionalFieldValue : '-'),
                    cUserID: userID ? userID : '0001',
                    cType: stream,
                    preFillData: oTemplateType.preFillData,
                    startHeaderRowIndex: this._oGetTemplateMetaDataDetails[0]['startHeaderRowIndex'],
                };

                laneSchedule.push({
                    iTemplateTypeID: iTemplateTypeID,
                    jDump: oParams
                })

                // if (oTemplateType.preFillData == 'no' || this._cUploadType == 'DISTRIBUTE') {
                //     let oResponseParse;
                //     let selectedMember;
                //     let selectedMembersDataList = [];
                //     let oMemberEmailAndScac = [];
                //     let cDistributionDetails = {};
                //     let type = "prefilledno";
                //     let uploadFilePath = oParams.cFileDir + oParams.cFileName + oParams.cFileType;
                //     let fullUploadPath = await this._oCommonCls.FunDCT_UploadS3File(uploadFilePath, type);//upload & return file path for status file.
                // }


            }
            return laneSchedule;

        } catch (oErr) {
            if (this._cUploadType == 'DISTRIBUTE') {
                let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                if (!oStatus) {
                    return [];
                }
                let iStatusID = oStatus._id;
                let oPendingConslReq = await TmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 });
                const aRequestDetails = { bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
                let data = await TmplUploadLog.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']), iActiveStatus: 0 },
                    { $set: aRequestDetails },
                    { new: true }
                );
            }
            if (this._cUploadType !== 'DISTRIBUTE') {
                let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                if (!oStatus) {
                    return [];
                }
                let iStatusID = oStatus._id;
                let oPendingConslReq = await MemTmplUploadLog.find({ iStatusID: iStatusID, bProcesslock: 'Y', iActiveStatus: 0 });
                const aRequestDetails = { bProcesslock: 'N', bProcessed: 'F', tProcessEnd: new Date(), tUpdated: new Date() };
                let data = await MemTmplUploadLog.findOneAndUpdate(
                    { iStatusID: iStatusID, _id: new mongoose.Types.ObjectId(oPendingConslReq[0]['_id']), iActiveStatus: 0 },
                    { $set: aRequestDetails },
                    { new: true }
                );
            }

            this._oCommonCls.error(oErr.message);
            // process.exit(1);
        }
    }

    public getTemplateUpload = async (id: any) => {
        try {
            this.FunDCT_setUserID('0001')
            this.FunDCT_ApiRequest({ baseUrl: '/API/PENDING_TEMPLATE_UPLOAD/' })
            let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            if (!oStatus) {
                return [];
            }
            let iStatusID = oStatus._id;
            const oPendingUploadLog = await TmplUploadLog.findOne({ _id: id, iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N', iActiveStatus: 0 }).lean() as ITmplUploadLog;
            if (oPendingUploadLog) {
                this.FunDCT_SetUploadType('DISTRIBUTE');
                return oPendingUploadLog;
            } else {
                const oPendingMemberUpload = await MemTmplUploadLog.findOne({ _id: id, iStatusID: iStatusID, bProcesslock: 'N', bProcessed: 'N', iActiveStatus: 0 }).lean() as IMemTmplUploadLog;
                if (oPendingMemberUpload) {
                    this.FunDCT_SetUploadType(oPendingMemberUpload.cUploadType);
                    return oPendingMemberUpload;
                }
                else {
                    return false;
                }
            }
        } catch (err) {
            this.error(err.message);
        }
    }

    public addUpdateDataIntoGenLaneAndGenLaneSchedule = async (cTemplateType, currentUserId, tmplUploadLogDetail) => {
        try {
            const templateTypeDetails = await TemplateType.find(
                { cTemplateType: cTemplateType }
            ).select('_id').lean();

            const query = {
                iTemplateTypeID: templateTypeDetails[0]._id,
                cProcessingType: "TemplateUpload",
            };

            // Check if document exists
            const existingDoc = await GenLane.findOne(query);

            let update;

            if (existingDoc) {
                // If document exists, increment iToDo
                update = {
                    $inc: { iToDo: 1 },
                    $set: {
                        iUpdatedby: currentUserId, // Update on modify
                        tUpdated: new Date()
                    }
                };
            } else {
                // If inserting new, set iToDo = 1
                update = {
                    $set: {
                        iTemplateTypeID: templateTypeDetails[0]._id,
                        cProcessingType: "TemplateUpload",
                        iToDo: 1,
                        iEnteredby: currentUserId,
                        tEntered: new Date()
                    }
                };
            }
            const options = { upsert: true, new: true };
            await GenLane.findOneAndUpdate(query, update, options);
            const jDumpDetails = await this.getJDumpDetails(templateTypeDetails[0]._id, tmplUploadLogDetail._id)
            await GenLaneSchedule.insertMany(jDumpDetails)
        } catch (error) {
            return error;
        }
    }

}
export default new ClsDCT_ManageTemplate();
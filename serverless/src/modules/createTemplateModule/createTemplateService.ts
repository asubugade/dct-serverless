
import { ClsDCT_ManageTemplate } from '../../commonModule/Class.managetemplate';
import TemplateValidation from '../../models/GenTemplateValidation';
import HttpStatusCodes from "http-status-codes";
import multer from 'multer';

import { parse } from "lambda-multipart-parser";
import fs from "fs";
import path from "path";
import { ClsDCT_Common } from '../../commonModule/Class.common';
import Template, { ITemplate } from '../../models/GenTemplate';
import TmplUploadLog from '../../models/Tmpluploadlog';
import MemTmplUploadLog from '../../models/MemTmplUploadLog';
import TmplConsolidationReq from '../../models/TmplConsolidationReq';
import MemberSubmissionDownloadLog from "../../models/MemberSubmissionDownloadLog";
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";
import { validationResult } from 'express-validator';
import Status, { IStatus } from '../../models/GenStatus';
import * as _ from "lodash";
import { ClsDCT_EmailTemplate } from '../../commonModule/Class.emailtemplate';
const { ObjectId } = require('mongodb');





export class CreateTemplateService {
  public _oStorage: any;
  public _oFileUpload: any;
  public _cTempFileImportExcelToJSON: string;
  public _cFileTypeImportExcelToJSON: string;
  public _cChangeType: string;


  private _oManageTemplateCls = new ClsDCT_ManageTemplate();
  private _oCommonCls = new ClsDCT_Common();
  private _oEmailTemplateCls = new ClsDCT_EmailTemplate();


  public FunDCT_SetChangeType(_cChangeType: string) {
    this._cChangeType = _cChangeType;
  }

  constructor() {
    this._oStorage = multer.diskStorage({
      destination: (oReq, file, cb) => {
        cb(null, this._oCommonCls.cDirTemplateImportExcelToJSONHeader);
      },
      filename: (oReq, file, cb) => {
        let cOriginalFileName = file.originalname.split('.').slice(0, -1).join('.');
        this._cTempFileImportExcelToJSON = 'CREATE_TEMPLATE-SAMPLE-' + cOriginalFileName + '_' + Date.now();
        this._cFileTypeImportExcelToJSON = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
        cb(null, this._cTempFileImportExcelToJSON + this._cFileTypeImportExcelToJSON);
      }
    });

    this._oFileUpload = multer({
      storage: this._oStorage
    });
  }


  public excelToJSON = async (event, formData) => {
    try {
      this._oManageTemplateCls._oGetValidationRulesDetails = await TemplateValidation.find();
      this._oManageTemplateCls.FunDCT_setTemplateUserID(event.requestContext.authorizer._id);

      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
      await this._oManageTemplateCls.FunDCT_SetCurrentUserDetails(cToken);
      this._oManageTemplateCls.FunDCT_ApiRequest(event)
      let validateTemplateResponce = await this._oManageTemplateCls.FunDCT_ValidateTemplate(formData);
      let oTemplate = JSON.parse(validateTemplateResponce)
      if (oTemplate.cStatus == 'Success') {
        console.log("================sssssssss>", oTemplate);
        
        let objRes: any = await this._oManageTemplateCls.FunDCT_ExcelToJSON_Converter(oTemplate);
        if (objRes.cStatus == 'Success') {
          let oJSONRes = {
            aModuleDetails: objRes
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'EXCELTOJSON_CONVERTED', 200, oJSONRes);
        } else {
          let oJSONRes = {
            aModuleDetails: objRes
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'EXCELTOJSON_UNSUCESS', 200, oJSONRes);
        }
      }
      else {
        let oJSONRes = {
          aModuleDetails: oTemplate
        };
        if (oTemplate.cStatus == 'ErrorValidation') {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CREATE_TEMPLATE', 'SAMPLE_TEMPLATE_INVALID_VALIDATION', 200, oJSONRes);
        }
        else {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CREATE_TEMPLATE', 'SAMPLE_TEMPLATE_VALIDATION', 200, oJSONRes);
        }
      }


    } catch (err) {
      console.error("Error processing file:", err);
      return this._oCommonCls.FunDCT_Handleresponse(
        "Error",
        "APPLICATION",
        "SERVER_ERROR",
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        { error: err.message }
      );
    }
  };



  public saveTemplateDocument = async (event) => {
    try {
      const body = JSON.parse(event.body);
      let cChangeType: any;
      const { cMode, cTemplateType, cHeaderType, cTemplateName, oTemplateNameRedistribution, iMaxDepthHeaders, aTemplateHeader, aAdditionalConfiguration, iTemplateID, iTempActiveStatus } = body;
      this._oCommonCls.FunDCT_ApiRequest(event)
      this._oCommonCls.log('saving template')
      let objRes: any;
      if (cMode == 'ReDistributeTemplate') {
        cChangeType = 'Stucture Change';
      }
      else if (cMode == 'EditTemplateWithModification') {
        cChangeType = 'Data Change';
      }
      if (cMode == 'ReDistributeTemplate' || cMode == 'EditTemplateWithModification') {

        if (oTemplateNameRedistribution !== cTemplateName) {
          // const TemplateDetails = 
          await Template.updateOne(
            { cTemplateName: oTemplateNameRedistribution, _id: iTemplateID },
            { $set: { cTemplateName: cTemplateName } }
          );
          // const TmplUploadLogsDetails = 
          await TmplUploadLog.updateMany(
            { cTemplateName: oTemplateNameRedistribution, iTemplateID: iTemplateID },
            { $set: { cTemplateName: cTemplateName } }
          );
          // const MemberTmplUploadLogsDetails = 
          await MemTmplUploadLog.updateMany(
            { cTemplateName: oTemplateNameRedistribution, iTemplateID: iTemplateID },
            { $set: { cTemplateName: cTemplateName } }
          );
          // const TmplConsolidationReqDetails = 
          await TmplConsolidationReq.updateMany(
            { cTemplateName: oTemplateNameRedistribution, iTemplateID: iTemplateID },
            { $set: { cTemplateName: cTemplateName } }
          );
          // const MemberSubmissionDownloadLogDetails = 
          await MemberSubmissionDownloadLog.updateMany(
            { cTemplateName: oTemplateNameRedistribution, iTemplateID: iTemplateID },
            { $set: { cTemplateName: cTemplateName } }
          );
        }
        let oTemplates = await Template.findOne({ cTemplateName: cTemplateName, _id: iTemplateID }).lean() as ITemplate;
        if (oTemplates) {
          //Compare Template Details
          if (oTemplates.cTemplateType == cTemplateType && oTemplates.cTemplateName == cTemplateName) {
            this._oManageTemplateCls._oGetTemplateMetaDataDetails = await TmplMetaData.find({ "iTemplateID": iTemplateID });
            if (this._oManageTemplateCls._oGetTemplateMetaDataDetails) {
              let iTotHeaders = this._oManageTemplateCls._oGetTemplateMetaDataDetails[0].aTemplateHeader.length;
              let iTotHeadersRequest = aTemplateHeader.length;

              let aTemplateHeaderDB = this._oManageTemplateCls._oGetTemplateMetaDataDetails[0].aTemplateHeader;
              let aAdditionalConfigurationDB = this._oManageTemplateCls._oGetTemplateMetaDataDetails[0].aAdditionalConfiguration;
              let iTotAdditionalConfigurationDB = this._oManageTemplateCls._oGetTemplateMetaDataDetails[0].aAdditionalConfiguration.length;
              let iTotAdditionalConfigurationRequest = aAdditionalConfiguration.length;

              if (iTotHeaders == iTotHeadersRequest && iTotHeaders > 0 && iTotHeadersRequest > 0 && iTotAdditionalConfigurationDB == iTotAdditionalConfigurationRequest) {
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
                const aTemplateHeaderDBSpecific = pickDeep(aTemplateHeaderDB, ['cHeaderLabel', 'cParentHeader']);
                const aTemplateHeaderSpecific = pickDeep(aTemplateHeader, ['cHeaderLabel', 'cParentHeader']);
                const bHeaderLabel = _.isEqual(aTemplateHeaderDBSpecific, aTemplateHeaderSpecific);
                const bHeaderConfiguration = _.isEqual(aAdditionalConfigurationDB, aAdditionalConfiguration);
                cChangeType = (bHeaderLabel === true && bHeaderConfiguration === true) ? 'Data Change' : cChangeType;
              }
            }
          }
        }

        this.FunDCT_SetChangeType(cChangeType);
        return objRes = await this.FunDCT_TemplateAddUpdate(event);
      } else {
        return objRes = await this.FunDCT_TemplateAddUpdate(event);
      }

    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
    }
  }


  private FunDCT_TemplateAddUpdate = async (event) => {
    try {
      const body = JSON.parse(event.body);
      this._oCommonCls.FunDCT_ApiRequest(event)
      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
      this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      //cConsolidation added by spirgonde for Autogenerate Consolidation report on template expired 
      const { cMode, cHeaderType, cTemplateType, cTemplateName, aTemplateHeader, aAdditionalConfiguration, iMaxDepthHeaders, iTemplateID, cConsolidation, iTempActiveStatus } = body;
      const cChangeType = this._cChangeType;

      let oStatus;
      try {
        oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
      } catch (error) {
        throw new Error(error.message);
      }

      const aRequestDetails = { cTemplateName, cTemplateType, iStatusID: oStatus._id, iTempActiveStatus, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

      let oTemplates = await Template.findOne({ cTemplateName: cTemplateName }).lean() as any;
      if (oTemplates) {
        // Update
        aRequestDetails.iTempActiveStatus = oTemplates.iTempActiveStatus
        oTemplates = await Template.findOneAndUpdate(
          { cTemplateName: cTemplateName },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as ITemplate;

        let aRequestDetailsMetaData: any;
        let cAddtionalFile: string = "";
        if (cMode == 'ReDistributeTemplate') {
          if (cChangeType == 'Stucture Change') {
            aRequestDetailsMetaData = {
              iTemplateID, cHeaderType, iMaxDepthHeaders, aTemplateHeader, aAdditionalConfiguration, cAddtionalFile, cDistributionStatus: 'Redistribute-StructureChange', iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date(), iRedistributedIsUploaded: '1'
            };
            await TmplMetaData.updateOne({ iTemplateID: ObjectId(iTemplateID) }, { $unset: { aDistributedData: 1, aMemberCutoffs: 1, aConsolidationData: 1, aMappedColumns: 1, aUnMappedColumns: 1, aMappedScacColumnsStat: 1, cEmailText: 1, cEmailSubject: 1, cEmailFrom: 1, cAdditionalEmail: 1, cAddtionalFile: 1 } });
          } else if (cChangeType == 'Data Change') {
            aRequestDetailsMetaData = {
              iTemplateID, cHeaderType, iMaxDepthHeaders, aTemplateHeader, aAdditionalConfiguration, cAddtionalFile, cDistributionStatus: 'Redistribute-DataChange', iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date(), iRedistributedIsUploaded: '1'
            };
          }
        }
        else if (cMode == 'EditTemplateWithModification') {
          if (cChangeType == 'Data Change') {
            aRequestDetailsMetaData = {
              iTemplateID, cHeaderType, iMaxDepthHeaders, aTemplateHeader, aAdditionalConfiguration, cAddtionalFile, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date()
            };
          }
        }

        let oTemplatesMetaData = await TmplMetaData.findOneAndUpdate(
          { iTemplateID: iTemplateID },
          { $set: aRequestDetailsMetaData },
          { new: true }
        );
        if (cChangeType == 'Stucture Change' || (cMode == 'EditTemplateWithModification' && cChangeType == 'Data Change')) {
          return await this.FunDCT_CreateSampleTemplateFile(oTemplates, oTemplatesMetaData, event);
        } else if (cChangeType == 'Data Change') {
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'TEMPLATE_UPDATED', 200, oTemplatesMetaData);
        }
      } else {
        // Create
        oTemplates = new Template(aRequestDetails);
        await oTemplates.save();

        let iTemplateID = oTemplates._id;
        //cConsolidation and cGenerated :'No' added by spirgonde for Autogenerate Consolidation report on template expired
        let cAddtionalFile: string = "";
        const aRequestDetailsMetaData = { iTemplateID, cHeaderType, iMaxDepthHeaders, aTemplateHeader, aAdditionalConfiguration, cAddtionalFile, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cConsolidation, cGenerated: 'No' };
        // Working
        let oTemplateMetaData = new TmplMetaData(aRequestDetailsMetaData);
        await oTemplateMetaData.save();
        //Create Sample file based on header label and validations - update cTemplateSampleFile
        return await this.FunDCT_CreateSampleTemplateFile(oTemplates, oTemplateMetaData, event);
      }
    } catch (err) {
      await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }


  private FunDCT_CreateSampleTemplateFile = async (oTemplates: any, oTemplateMetaData: any, event) => {
    try {
      this._oManageTemplateCls.FunDCT_setTemplateID(oTemplates._id);
      const oTemplateSampleFile: any = await this._oManageTemplateCls.FunDCT_createTemplateSampleFile(oTemplates, oTemplateMetaData); //Working
      if (oTemplateSampleFile['cStatus'] == 'Success') {
        let cTemplateSampleFile: string = oTemplateSampleFile.oResponse.cS3Url;
        const aRequestDetails = { cTemplateSampleFile, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date() };
        const oUpdateMetadatas = await Template.findOneAndUpdate(
          { _id: oTemplates._id },
          { $set: aRequestDetails },
          { new: true }
        );

        let iTemplateID = oTemplates._id;
        if (oTemplateSampleFile['iMaxDepthHeaders'] > 0) {
          const aUpdateHeaderDepth = { iMaxDepthHeaders: oTemplateSampleFile['iMaxDepthHeaders'], iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date() };

          let oTmplMetaDataUpdate = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
          if (oTmplMetaDataUpdate) {
            // Update
            oTmplMetaDataUpdate = await TmplMetaData.findOneAndUpdate(
              { iTemplateID: iTemplateID },
              { $set: aUpdateHeaderDepth },
              { new: true }
            ).lean() as ITmplMetaData;
          }
        }

        //Send Email Notification using Email Template
        var aVariablesVal = {
          DCTVARIABLE_USERNAME: this._oCommonCls.cUsername,
          DCTVARIABLE_SAMPLETEMPLATE: this._oCommonCls.cFrontEndURILocal + "sessions/s3download?downloadpath=" + cTemplateSampleFile,
          DCTVARIABLE_TEMPLATENAME: oTemplates.cTemplateName
        };
        await this._oEmailTemplateCls.FunDCT_SendNotification('CREATE_TEMPLATE', 'Template Created', aVariablesVal, this._oCommonCls.cEmail);

        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'TEMPLATE_INSERTED', 200, oUpdateMetadatas);
      } else {
        return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CREATE_TEMPLATE', 'SAMPLEFILE_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }


  public templateDelete = async (event) => {
    let oTemplate = await Template.findOne({ _id: event.pathParameters.id }).lean() as ITemplate;
    await TmplMetaData.findOne({ iTemplateID: event.pathParameters.id }).lean() as ITmplMetaData;

    if (oTemplate) {

      await Template.updateOne({ _id: event.pathParameters.id }, { $set: { iTempActiveStatus: -1 } });

      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'TEMPLATE_DELETED', 200, event.pathParameters.id);
    } else {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : TEMPLATE_DELETION ');
    }
  }
}


import { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import { FunDCT_ValidatePermission } from "../../middleware/auth";
import Request from "../../types/Request";
import User, { IUser } from "../../models/GenUser";
import GenTemplateType, { ITemplateType } from "../../models/GenTemplateType"
import { ClsDCT_Common } from '../../commonModule/Class.common';
import { ClsDCT_Message } from "../../commonModule/Class.message";
import { isNumber } from "util";
import { TypeOfExpression } from "typescript";
import { Schema } from "mongoose";
import { count } from "console";
import { cloudWatchClass } from "../../middleware/cloudWatchLogger";
import TemplateType from "../../models/GenTemplateType";
import Status, { IStatus } from "../../models/GenStatus";
import { getTemplateType, getTemplateTypeCount } from "./templateTypeDal";
import oConnectDB from "../../config/database";

export class TemplateTypeService {
    private _oCommonCls = new ClsDCT_Common();

    public templateTypeListing = async (event) => {
        try {
            const body = JSON.parse(event.body)
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cMode, aCode } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN']
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event);
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let cUserType = oCurrentUserType[0].cAccessCode;
            let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            const templateTypeArray:any = [];
            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;

            if (cUserType == 'Member') {
                if (Array.isArray(templateType)) {
                    for (const objectId of templateType) {
                        let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                        templateTypeArray.push(oUserTemplateTypeDetails['_doc'].cTemplateType);
                    }
                }
            }

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter && cUserType != 'Member') {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "cTemplateType": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }
                        ]
                    }
                };
            }
            else if (aRequestDetails.cSearchFilter && cUserType == 'Member') {
                cSearchFilterQuery = {
                    $match: {
                        $and: [
                            { "cTemplateType": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
                            { "cTemplateType": { "$in": templateTypeArray } }
                        ]
                    }
                }
            }
            else {
                cSearchFilterQuery = {
                    $match: templateTypeArray.length > 0 ? { "cTemplateType": { "$in": templateTypeArray } } : {}
                };
            }
            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let cStatusFilter;
            if (aCode && aCode == 'users') {
                cStatusFilter = {
                    $match: {
                        "oTemplateTypeListing": {
                            $elemMatch: { cStatusCode: "ACTIVE" }
                        }
                    }
                }
            }
            else {
                cStatusFilter = {
                    $match: {
                    }
                }
            };


            let iCount: number = await getTemplateTypeCount(cSearchFilterQuery, cStatusFilter);

            if (iCount > 0) {
                let oTemplateType: any = await getTemplateType(aRequestDetails, oSort, cSearchFilterQuery, iCount, cStatusFilter);
                if (oTemplateType) {
                    const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN']
                    await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
                    this._oCommonCls.FunDCT_ApiRequest(event)
                    let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
                    let cUserType = oCurrentUserType[0].cAccessCode;
                    let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
                    const templateTypeArray:any = [];
                    let oTemplateTypeRes;
                    if (!cMode && cMode !== 'TEMPLATE_TYPE') {
                        const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
                        if (Array.isArray(templateType)) {
                            for (const objectId of templateType) {
                                let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                                if (oStatus) {
                                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId, iStatusID: oStatus._id });

                                    if (oUserTemplateTypeDetails) {
                                        templateTypeArray.push(oUserTemplateTypeDetails['_doc']);
                                    }
                                }
                            }
                        }
                        templateTypeArray.sort((a, b) => a.cTemplateType.localeCompare(b.cTemplateType));
                        oTemplateTypeRes = {
                            total: iCount,
                            page: aRequestDetails.iOffset,
                            pageSize: aRequestDetails.iLimit,
                            aModuleDetails: templateTypeArray
                        };
                    }
                    else {
                        oTemplateTypeRes = {
                            total: iCount,
                            page: aRequestDetails.iOffset,
                            pageSize: aRequestDetails.iLimit,
                            aModuleDetails: oTemplateType
                        };
                    }
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_LISTED', 200, oTemplateTypeRes);
                }
            } else {
                let oTemplateTypeRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_LISTED', 200, oTemplateTypeRes);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public templateTypeAdd = async (event) => {
        try {
            const body = JSON.parse(event.body)
            const { cTemplateType, cTemplateTypeDesc, iStatusID, preFillData } = body;
            const aRequestDetails = { cTemplateType, cTemplateTypeDesc, iStatusID: iStatusID, preFillData, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oTemplateType = await GenTemplateType.findOne({ cTemplateType: cTemplateType }).lean() as ITemplateType;
            if (oTemplateType) {
                // Update
                oTemplateType = await GenTemplateType.findOneAndUpdate(
                    { cTemplateType: cTemplateType },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ITemplateType;;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_INSERTED', 200, oTemplateType);
            } else {
                // Create
                oTemplateType = new GenTemplateType(aRequestDetails);
                await oTemplateType.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_INSERTED', 200, oTemplateType);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public templateTypeUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body)

            const { cTemplateType, cTemplateTypeDesc, iStatusID, preFillData } = body;
            const aMessageFields = {
                cTemplateType,
                cTemplateTypeDesc,
                iStatusID: iStatusID,
                preFillData,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oTemplateType = await GenTemplateType.findOne({ _id: event.pathParameters.id }).lean() as ITemplateType;

            if (oTemplateType) {
                oTemplateType = await GenTemplateType.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aMessageFields },
                    { new: true }
                ).lean() as ITemplateType;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_UPDATED', 200, oTemplateType);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public templateTypeDelete = async (event) => {
        let oTemplateType = await GenTemplateType.findOne({ _id: event.pathParameters.id }).lean() as ITemplateType;
        if (oTemplateType) {
            await GenTemplateType.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_TYPE', 'TEMPLATE_TYPE_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }
}
import { ClsDCT_Common } from "../../commonModule/Class.common";
import Template from "../../models/GenTemplate";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import User, { IUser } from "../../models/GenUser";
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";
import TmplUploadLog, { ITmplUploadLog } from "../../models/Tmpluploadlog";
import { getMemberUploadLog, getTemplateUploadLogCount } from "./templateUploadLogDal";
import HttpStatusCodes from "http-status-codes";




export class TemplateUploadLogService {

    private _oCommonCls = new ClsDCT_Common();


    public templateUploadLogListByTemplateType = async (event) => {
        try {

            const body = JSON.parse(event.body)

            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes, cTemplateName } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                // "cTemplateName" added by spirgonde for template upload log searchfilter task
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "iTemplateID": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
                            { "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }
                        ]
                    }
                };
            }
            else if (cTemplateName && cTemplateName != '') {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "cTemplateName": cTemplateName },
                        ]
                    }
                };
            }
            else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN']
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event);
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let cUserType = oCurrentUserType[0].cAccessCode;
            let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            const templateTypeArray: any = [];

            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
            if (Array.isArray(templateType)) {
                for (const objectId of templateType) {
                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                    templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
                }
            }

            // let iCount: number = await this.FunDCT_GetTemplateUploadLogCount(cSearchFilterQuery, cTemplateTypes.length > 0 ?cTemplateTypes:templateTypeArray);
            let iCount: number = await getTemplateUploadLogCount(cSearchFilterQuery, Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray);
            if (iCount > 0) {
                let oTemplateUploadLogListing: any = await getMemberUploadLog(aRequestDetails, oSort, cSearchFilterQuery, iCount, cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray);
                let templateIDs: any[];
                let templateArray: any = [];
                if (oTemplateUploadLogListing) {

                    for (const logItem of oTemplateUploadLogListing) {
                        const iTemplateID = logItem.iTemplateID;
                        if (logItem.bExceptionfound == 'N' && logItem.bProcessed == 'Y') {
                            let oTmplMetaDataUpdate = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;

                            if (oTmplMetaDataUpdate) {
                                oTmplMetaDataUpdate = await TmplMetaData.findOneAndUpdate(
                                    { iTemplateID: iTemplateID },
                                    { $set: { cAddtionalFile: logItem.cAddtionalFile } },  // Assuming `logItem.cAddtionalFile` contains the new value
                                    { new: true }
                                ).lean() as ITmplMetaData;
                            }
                        }
                    }
                    templateIDs = oTemplateUploadLogListing.map((item: any) => item.iTemplateID);

                    const templates = await Template.find({ _id: { $in: templateIDs }, iTempActiveStatus: 0 });

                    if (templates.length > 0) {
                        templateArray = templates.map(template => template['_doc']);
                    }

                    let matchingTemplateNames;
                    if (cTemplateTypes && cTemplateTypes.length > 0) {
                        matchingTemplateNames = templateArray
                            .filter(template => cTemplateTypes.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    } else {
                        matchingTemplateNames = templateArray
                            .filter(template => templateTypeArray.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }

                    let oTemplateUploadLogListingResp;
                    if (matchingTemplateNames && matchingTemplateNames.length > 0) {
                        oTemplateUploadLogListingResp = oTemplateUploadLogListing.filter(template =>
                            matchingTemplateNames.includes(template.cTemplateName)
                        );
                        oTemplateUploadLogListing = oTemplateUploadLogListingResp;
                    } else {
                        oTemplateUploadLogListing = [];
                    }

                    const enteredByIds = oTemplateUploadLogListing.map(item => item.iEnteredby.toString());
                    let users: any = await User.find({ _id: { $in: enteredByIds } });
                    oTemplateUploadLogListing = oTemplateUploadLogListing.map(item => {
                        const user = users.find(u => u._id.toString() === item.iEnteredby.toString());
                        if (user) {
                            item.cUploadedBy = user.cName;
                        }
                        return item;
                    });

                    let oTemplatelogRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oTemplateUploadLogListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplatelogRes);
                }
            } else {
                let oTemplatelogListing = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplatelogListing);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }


    public templateUploadLogList = async (event) => {
        try {
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes, cTemplateName } = JSON.parse(event.body);
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                // "cTemplateName" added by spirgonde for template upload log searchfilter task
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "iTemplateID": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
                            { "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }
                        ]
                    }
                };
            }
            else if (cTemplateName && cTemplateName != '') {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "cTemplateName": cTemplateName },
                        ]
                    }
                };
            }
            else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN']
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event);
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let cUserType = oCurrentUserType[0].cAccessCode;
            let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            const templateTypeArray: any = [];

            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
            if (Array.isArray(templateType)) {
                for (const objectId of templateType) {
                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                    templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
                }
            }

            // let iCount: number = await this.FunDCT_GetTemplateUploadLogCount(cSearchFilterQuery, cTemplateTypes.length > 0 ?cTemplateTypes:templateTypeArray);
            let iCount: number = await getTemplateUploadLogCount(cSearchFilterQuery, Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray);
            if (iCount > 0) {
                let oTemplateUploadLogListing: any = await getMemberUploadLog(aRequestDetails, oSort, cSearchFilterQuery, iCount, cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray);
                let templateIDs: any[];
                let templateArray: any = [];
                if (oTemplateUploadLogListing) {

                    for (const logItem of oTemplateUploadLogListing) {
                        const iTemplateID = logItem.iTemplateID;
                        if (logItem.bExceptionfound == 'N' && logItem.bProcessed == 'Y') {
                            let oTmplMetaDataUpdate = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;

                            if (oTmplMetaDataUpdate) {
                                oTmplMetaDataUpdate = await TmplMetaData.findOneAndUpdate(
                                    { iTemplateID: iTemplateID },
                                    { $set: { cAddtionalFile: logItem.cAddtionalFile } },  // Assuming `logItem.cAddtionalFile` contains the new value
                                    { new: true }
                                ).lean() as ITmplMetaData;
                            }
                        }
                    }
                    templateIDs = oTemplateUploadLogListing.map((item: any) => item.iTemplateID);

                    const templates = await Template.find({ _id: { $in: templateIDs }, iTempActiveStatus: 0 });

                    if (templates.length > 0) {
                        templateArray = templates.map(template => template['_doc']);
                    }

                    let matchingTemplateNames;
                    if (cTemplateTypes && cTemplateTypes.length > 0) {
                        matchingTemplateNames = templateArray
                            .filter(template => cTemplateTypes.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    } else {
                        matchingTemplateNames = templateArray
                            .filter(template => templateTypeArray.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }

                    let oTemplateUploadLogListingResp;
                    if (matchingTemplateNames && matchingTemplateNames.length > 0) {
                        oTemplateUploadLogListingResp = oTemplateUploadLogListing.filter(template =>
                            matchingTemplateNames.includes(template.cTemplateName)
                        );
                        oTemplateUploadLogListing = oTemplateUploadLogListingResp;
                    } else {
                        oTemplateUploadLogListing = [];
                    }

                    const enteredByIds = oTemplateUploadLogListing.map(item => item.iEnteredby.toString());
                    let users = await User.find({ _id: { $in: enteredByIds } }).lean() as any;
                    oTemplateUploadLogListing = oTemplateUploadLogListing.map(item => {
                        const user = users.find(u => u._id.toString() === item.iEnteredby.toString());
                        if (user) {
                            item.cUploadedBy = user.cName;
                        }
                        return item;
                    });

                    let oTemplatelogRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oTemplateUploadLogListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplatelogRes);
                }
            } else {
                let oTemplatelogListing = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplatelogListing);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public templateUploadLogDelete = async (event) => {
        const oTmplUploadLog = await TmplUploadLog.findOne({ _id: event.pathParameters.id, iActiveStatus: 0 }).lean() as ITmplUploadLog;

        if (oTmplUploadLog) {
            if (oTmplUploadLog.bProcessed === 'Y') {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'TEMPLATE_UPLOAD_LOG', 'LOG_ALREADY_PROCESSED', HttpStatusCodes.BAD_REQUEST, '');
            } else {
                await TmplUploadLog.updateOne(
                    { _id: event.pathParameters.id },
                    { $set: { iActiveStatus: -1, bExceptionfound: 'Y', bProcesslock: 'N', bProcessed: 'F' } }
                );

                await TmplMetaData.updateOne(
                    { iTemplateID: oTmplUploadLog.iTemplateID },
                    { $set: { iRedistributedIsUploaded: "1" } }
                );

                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'TEMPLATE_UPLOAD_LOG', 'TEMPLATE_UPLOAD_LOG_DELETED', 200, event.pathParameters.id);
            }
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'TEMPLATE_UPLOAD_LOG', 'LOG_NOT_FOUND', HttpStatusCodes.BAD_REQUEST, '');
        }
    }
}
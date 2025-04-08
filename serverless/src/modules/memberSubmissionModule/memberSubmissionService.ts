import { ClsDCT_Common } from "../../commonModule/Class.common";
import Status, { IStatus } from "../../models/GenStatus";
import Template from "../../models/GenTemplate";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import User from "../../models/GenUser";
import MemberSubmissionDownloadLog from "../../models/MemberSubmissionDownloadLog";
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";
import { memberSubmissionLog, memberSubmissionLogListingCount } from "./memberSubmissionDal";
import HttpStatusCodes from "http-status-codes";



export class MemberSubmissionService {
    private _oCommonCls = new ClsDCT_Common();

    public memberSubmissionLogListing = async (event) => {
        try {
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes } = JSON.parse(event.body);
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };
            let cSearchFilterQuery: any = { $match: {} };
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "iTemplateID": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
                            { "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }
                        ]
                    }
                };
            }

            let oSort: any = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event);
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let cUserType = oCurrentUserType[0].cAccessCode;
            let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            const templateTypeArray: any[] = [];

            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
            if (Array.isArray(templateType)) {
                for (const objectId of templateType) {
                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                    templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
                }
            }
            let iCount: number = await memberSubmissionLogListingCount(
                cSearchFilterQuery,
                Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray
            );
            if (iCount > 0) {
                let templateIDs: any[];
                let templateArray: any[] = [];
                let oConsolidationLogListing: any = await memberSubmissionLog(aRequestDetails, oSort, cSearchFilterQuery, iCount, cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray);
                if (oConsolidationLogListing) {
                    templateIDs = oConsolidationLogListing.map((item: any) => item.iTemplateID);
                    const oTemplate = await Template.find({ _id: { $in: templateIDs }, iTempActiveStatus: 0 });

                    if (oTemplate.length > 0) {
                        templateArray = oTemplate.map(template => template['_doc']);
                    }

                    let matchingTemplateNames: string[];
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
                        oTemplateUploadLogListingResp = oConsolidationLogListing.filter(template =>
                            matchingTemplateNames.includes(template.cTemplateName)
                        );
                        oConsolidationLogListing = oTemplateUploadLogListingResp;
                    } else {
                        oConsolidationLogListing = [];
                    }

                    const enteredByIds = oConsolidationLogListing.map(item => item.iEnteredby.toString());
                    let users = await User.find({ _id: { $in: enteredByIds } }).lean();
                    oConsolidationLogListing = oConsolidationLogListing.map(item => {
                        const user = users.find(u => u._id.toString() === item.iEnteredby.toString());
                        if (user) {
                            item.cRequestedBy = user.cName; // Assuming cName is the property you want to add
                        }
                        return item;
                    });

                    let oTemplatelogRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oConsolidationLogListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 200, oTemplatelogRes);
                }
            } else {
                let oTemplatelogListing = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 200, oTemplatelogListing);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err.message);
        }
    }


    public memberSubmissionLogListingById = async (event) => {
        try {
            const { cSearchFilter, iTemplateMetaDataID, aMemberScacCode } = JSON.parse(event.body);
            const aRequestDetails = { cSearchFilter, iTemplateMetaDataID, aMemberScacCode };
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event)
            let userID = this._oCommonCls.FunDCT_getUserID();
            let cSearchFilterQuery: any;

            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "iTemplateMetaDataID": { "$regex": aRequestDetails.iTemplateMetaDataID, "$options": "i" } },
                            { "IsConsolidationRequested.IsAlreadyRequested": true }
                        ],
                    }
                };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let data: any = [];
            let iCount: number = await memberSubmissionLogListingCount(cSearchFilterQuery, []);
            if (iCount > 0) {

                let oSubmissoionLogListing: any = await MemberSubmissionDownloadLog.aggregate([
                    cSearchFilterQuery,
                    {
                        $lookup: {
                            from: "gen_statuses",
                            localField: "iStatusID",
                            foreignField: "_id",
                            as: "oTemplateConsolidationLogListing"
                        },
                    },
                    { $unwind: "$oTemplateConsolidationLogListing" },
                ]
                );
                oSubmissoionLogListing.filter(record => {
                    let iEnteredby = record.IsConsolidationRequested.iEnteredby;
                    let iTemplateMetaDataID = record.IsConsolidationRequested.iTemplateMetaDataID;
                    let aMemberScacCode = record.IsConsolidationRequested.aMemberScacCode;
                    if (iEnteredby == userID && iTemplateMetaDataID == aRequestDetails.iTemplateMetaDataID && aMemberScacCode == aRequestDetails.aMemberScacCode) {
                        data = [record];
                    }
                });
                return data;
            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 'MEMBER_SUBMISSION_TEMPLATE_LOGS', 200, data);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err.message);
        }
    }


    public downloadMemberSubmission = async (event) => {
        try {
            this._oCommonCls.FunDCT_ApiRequest(event)
            const { iTemplateMetaDataID, aMemberScacCode, IsAlreadyRequested } = JSON.parse(event.body);
            let oTemplateMeta = await TmplMetaData.findOne({ _id: iTemplateMetaDataID }).lean() as ITmplMetaData;
            let iTemplateID = oTemplateMeta.iTemplateID;
            let oStatus;
            try {
                oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            } catch (error) {
                this._oCommonCls.log(error)
                throw new error
            }

            let IsConsolidationRequested = {
                iEnteredby: event.requestContext.authorizer._id,
                iTemplateMetaDataID,
                aMemberScacCode,
                IsAlreadyRequested: IsAlreadyRequested,
            }
            const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);

            const aRequestDetails = { iTemplateID: iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, bProcesslock: 'N', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), aMemberScacCode, IsConsolidationRequested };
            let oTemplates = new MemberSubmissionDownloadLog(aRequestDetails);
            await oTemplates.save();
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_SUBMISSION_TEMPLATE', 'MEMBER_SUBMISSION_REQUEST_SUBMITTED', 200, oTemplates);

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err.message);

        }
    }


}
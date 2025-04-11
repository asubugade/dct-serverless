import { ClsDCT_Common } from "../../commonModule/Class.common";
import Template from "../../models/GenTemplate";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import User from "../../models/GenUser";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../../models/MemTmplUploadLog";
import { getMemberUploadLog, getMemberUploadLogCount } from "./memberUploadDal";
import HttpStatusCodes from "http-status-codes";
import mime from 'mime-types';



export class MemberUploadService {
    private _oCommonCls = new ClsDCT_Common();
    public memberUploadLogListing = async (event) => {
        try {
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes, cTemplateName } = JSON.parse(event.body);
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes, cTemplateName };
            //added by stewari for show member upload log according to user
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event)
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let type = oCurrentUserType[0].cAccessCode;
            let cCompanyname = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            let cMemberCond: any;
            if (type !== 'Admin' && type !== 'CENTRIC') {
                cMemberCond = { cScacCode: { $in: [cCompanyname] } };
            } else {
                cMemberCond = {}
            }
            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cScacCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }], $and: [cMemberCond] } };
            } else {// code added by spirgonde for member upload log searchfilter  task start
                if (type !== 'Admin' && type !== 'CENTRIC') {
                    cSearchFilterQuery = { $match: { "cScacCode": cCompanyname } };
                } else {
                    cSearchFilterQuery = { $match: {} };
                }
            }
            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }
            const templateTypeArray: any = [];
            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
            if (Array.isArray(templateType)) {
                for (const objectId of templateType) {
                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                    templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
                }
            }
            let cDateQuery: any = [];
            if (aRequestDetails.cTemplateName) {
                cDateQuery = [
                    {
                        $match: {
                            cTemplateName: cTemplateName // Match documents where cTemplateName is 'TemplateName1'
                        }
                    }
                ];
            }
            let iCount: number = await getMemberUploadLogCount(cSearchFilterQuery, cDateQuery, Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray);
            if (iCount > 0) {
                let oMemberUploadLogListing: any = await getMemberUploadLog(aRequestDetails, oSort, cSearchFilterQuery, cDateQuery, iCount, cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray);
                let templateIDs: any[];
                let templateArray: any = [];
                if (oMemberUploadLogListing) {
                    templateIDs = oMemberUploadLogListing.map((item: any) => item.iTemplateID);

                    const templates = await Template.find({ _id: { $in: templateIDs }, iTempActiveStatus: 0 });

                    if (templates.length > 0) {
                        templateArray = templates.map(template => template);
                    }

                    let matchingTemplateNames;
                    if (cTemplateTypes && cTemplateTypes.length > 0) {
                        matchingTemplateNames = templateArray
                            .filter(template => cTemplateTypes.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }
                    else {
                        matchingTemplateNames = templateArray
                            .filter(template => templateTypeArray.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }

                    let oTemplateUploadLogListingResp;
                    if (matchingTemplateNames && matchingTemplateNames.length > 0) {
                        oTemplateUploadLogListingResp = oMemberUploadLogListing.filter(template =>
                            matchingTemplateNames.includes(template.cTemplateName)
                        );
                        oMemberUploadLogListing = oTemplateUploadLogListingResp;
                    }
                    else {
                        oMemberUploadLogListing = [];
                    }

                    const enteredByIds = oMemberUploadLogListing.map(item => item.iEnteredby.toString());
                    // let users = await User.find({ _id: { $in: enteredByIds } });
                    let users = await User.find({ _id: { $in: enteredByIds } }).select('cName cEmail').lean();
                    oMemberUploadLogListing = oMemberUploadLogListing.map(item => {
                        const user = users.find(u => u._id.toString() === item.iEnteredby.toString());
                        if (user) {
                            item.cUploadedBy = user.cName; // Assuming cName is the property you want to add
                            item.cEmailUploadedBy = user.cEmail;
                        }
                        return item;
                    });

                    let oMessageRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oMemberUploadLogListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oMessageRes);
                }
            } else {
                let oTemplateListing = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListing);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public downloadTemplate = async (event) => {
        const { _id } = JSON.parse(event.body);
        let oMemTmplUploadLog = await MemTmplUploadLog.findOne({ _id: _id, iActiveStatus: 0 }).lean() as IMemTmplUploadLog;
        const fileExtension = oMemTmplUploadLog.cTemplateStatusFile.split('.').pop(); // Extract file extension
        const contentType = mime.lookup(fileExtension) || 'application/octet-stream';
        if (oMemTmplUploadLog) {

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${oMemTmplUploadLog.cTemplateStatusFile.split('/').pop()}"`,
                },
                body: oMemTmplUploadLog.cTemplateStatusFile,
                isBase64Encoded: true,
            };
        }
    }

    public memberUploadLogDelete = async (event) => {
        let oMemberUploadLog = await MemTmplUploadLog.findOne({ _id: event.pathParameters.id, iActiveStatus: 0 }).lean() as IMemTmplUploadLog;
        if (oMemberUploadLog) {
            if (oMemberUploadLog.bProcessed === 'Y') {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'MEMBER_UPLOAD_LOG', 'LOG_ALREADY_PROCESSED', HttpStatusCodes.BAD_REQUEST, '');
            } else {
                await MemTmplUploadLog.updateOne({ _id: event.pathParameters.id }, { $set: { iActiveStatus: -1, bExceptionfound: 'Y', bProcesslock: 'N', bProcessed: 'F' } });
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_UPLOAD_LOG', 'MEMBER_UPLOAD_LOG_DELETED', 200, event.pathParameters.id);
            }
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'MEMBER_UPLOAD_LOG', 'LOG_NOT_FOUND', HttpStatusCodes.BAD_REQUEST, '');
        }
    }
}
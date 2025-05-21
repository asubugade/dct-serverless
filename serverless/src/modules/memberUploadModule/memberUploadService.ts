import { validationResult } from "express-validator";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import GenMember, { IMember } from "../../models/GenMember";
import Status, { IStatus } from "../../models/GenStatus";
import Template from "../../models/GenTemplate";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import User from "../../models/GenUser";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../../models/MemTmplUploadLog";
import { getMemberUploadLog, getMemberUploadLogCount } from "./memberUploadDal";
import HttpStatusCodes from "http-status-codes";
import mime from 'mime-types';
import TmplUploadLog, { ITmplUploadLog } from "../../models/Tmpluploadlog";
import path from 'path';
import GenEmailtemplates, { IEmailtemplates } from "../../models/GenEmailtemplates";
import { ClsDCT_EmailTemplate } from "../../commonModule/Class.emailtemplate";
import { ClsDCT_ManageTemplate } from "../../commonModule/Class.managetemplate";


var mongoose = require('mongoose')
const AdmZip = require('adm-zip');
export class MemberUploadService {
    private _oEmailTemplateCls = new ClsDCT_EmailTemplate();
    private _oCommonCls = new ClsDCT_Common();
    private clsDCT_ManageTemplate = new ClsDCT_ManageTemplate()

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

    public memberUploadTemplate = async (formData, event) => {
        try {
            let _cFileTypeUploadTemplate: any;
            let oFileStream;
            let cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];

            if (cToken) {
                await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            }

            this._oCommonCls.FunDCT_ApiRequest(event)
            const errors = validationResult(event);
            if (!errors.isEmpty()) {
                return (event
                    .status(HttpStatusCodes.BAD_REQUEST)
                    .json({ errors: errors.array() }))
            }
            let { iTemplateID, cUploadType, cTemplateType, cEmailText, aTemplateFileName, aTemplateFileSize, isRateExtendMode } = formData;
            let memberFilePath;
            let oMemTmplUploadLog: IMemTmplUploadLog[] = await MemTmplUploadLog.find({ aTemplateFileName: aTemplateFileName, iActiveStatus: 0 });
            let isConditionMet
            if (oMemTmplUploadLog) {
                isConditionMet = oMemTmplUploadLog.some(log =>
                    log.bProcessed == 'N'
                );
            }
            if (isConditionMet) {
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'UPLOAD_TEMPLATE', 'TEMPLATE_ALREADY_REQUESTED', 200, isConditionMet);
            }
            else {
                let oStatus;
                try {
                    oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                } catch (error) {
                    this._oCommonCls.log(error)
                    throw new error
                }
                let cMemberEmail
                let cSelectedMemebersModel = this._oCommonCls.oCurrentUserDetails.cCompanyname;
                let oMembersDetails = await GenMember.findOne({ cScac: cSelectedMemebersModel }).lean() as IMember;
                if (oMembersDetails) {
                    cMemberEmail = oMembersDetails.cEmail;
                }
                const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);
                if (true) {
                    if (isRateExtendMode == 'true') {
                        const oUploadlogs = await TmplUploadLog.findOne({ iTemplateID: { $in: [new mongoose.Types.ObjectId(iTemplateID)] }, iActiveStatus: 0 }).sort({ _id: -1 })
                        if (oUploadlogs) {
                            for (let obj in oUploadlogs.cDistributionDetails) {
                                if (oUploadlogs.cDistributionDetails[obj].cDistScaccode == cSelectedMemebersModel) {
                                    memberFilePath = oUploadlogs.cDistributionDetails[obj].cMemberDistributionFilePath
                                    break;
                                }
                            }
                        }
                        oFileStream = await this._oCommonCls.FunDCT_DownloadS3File(memberFilePath);
                        if (oFileStream) {

                            // const destinationDir = process.env.HOME_DIR + 'assets/templates/uploadtemplate/member/';
                            // Ensure the destination directory exists
                            // if (!fs.existsSync(destinationDir)) {
                            //     fs.mkdirSync(destinationDir, { recursive: true });
                            // }
                            // Destination file path
                            // const destinationFilePath = path.join(destinationDir, cSelectedMemebersModel + '_' + oTemplateDetails[0].iTemplateCounter+ '_' + oTemplateDetails[0].cTemplateName + '.xlsx');
                            // console.log("destinationFilePath===>" , destinationFilePath);

                            // try {
                            //     // Copy file
                            //     fs.copyFileSync(oFileStream, destinationFilePath);
                            // } catch (error) {
                            //     console.error('Error copying the file:', error);
                            // }

                            // return res.sendFile(oFileStream) ;
                            aTemplateFileName = cSelectedMemebersModel + '_' + oTemplateDetails[0].iTemplateCounter + '_' + oTemplateDetails[0].cTemplateName + '.xlsx';
                            const aTemplateFileNameOnly = cSelectedMemebersModel + '_' + oTemplateDetails[0].iTemplateCounter + '_' + oTemplateDetails[0].cTemplateName;
                            const _cTempFileUploadTemplate = aTemplateFileNameOnly;
                            const fileSizeInBytes = oFileStream.length;
                            aTemplateFileSize = (fileSizeInBytes / 1024).toFixed(2) + ' KB';
                            _cFileTypeUploadTemplate = path.extname(memberFilePath);

                        }
                    }
                    let cRenamedFile = await this._oCommonCls.FunDCT_UploadProfileImage(isRateExtendMode == 'true' ? oFileStream : formData.aTemplateFileInfo.content, this._oCommonCls.cAWSBucket + '/templates/uploadtemplate/interteam/' + 'MEMBER_UPLOAD-' + iTemplateID + '-' + Date.now() + _cFileTypeUploadTemplate);
                    let cAddtionalFile;
                    if (formData?.cAdditionalFiles?.length > 0) {
                        this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- filePathArray')
                        const zip = new AdmZip();
                        formData?.cAdditionalFiles?.forEach((file) => {
                            zip.addFile(file.filename + '_' + Date.now() + file.filename.substring(file.filename.lastIndexOf('.'), file.filename.length), file.content);
                        });
                        const zipBuffer = zip.toBuffer();
                        const zipPath = `${this._oCommonCls.cDirTemplateInterTeamUploadTemplate}${iTemplateID}_UploadTemplate_AdditionalFile_${Date.now()}.zip`;
                        try {
                            let type = "member";
                            let response = await this._oCommonCls.FunDCT_UploadS3File(zipPath, type, zipBuffer);
                            cAddtionalFile = response;
                            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- cAddtionalFile')
                        } catch (error) {
                            this._oCommonCls.log('Something went wrong while uploading file/files! ' + error);
                        }
                    } else {
                        cAddtionalFile = "not Provided at the time of Template upload";
                    }
                    formData.cAdditionalFiles = []; // To reset additional filepath array to empty.
                    const oMemberDetails = await this._oCommonCls.FunDCT_SetMemberDetailsByScac(this._oCommonCls.oCurrentUserDetails.cCompanyname);
                    let iMemberID = this._oCommonCls.FunDCT_GetMemberID();
                    const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, iMemberID: iMemberID, cScacCode: this._oCommonCls.oCurrentUserDetails.cCompanyname, cTemplateFile: cRenamedFile, iActiveStatus: 0, cUploadType: 'MEMBER_UPLOAD', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cAddtionalFile: cAddtionalFile, cAddtionalComment: cEmailText, aTemplateFileName, aTemplateFileSize, isRateExtendMode };//cAddtionalFile added by spirgonde for additional file upload task
                    let oTemplates = new MemTmplUploadLog(aRequestDetails);
                    let memTmplUploadLogDetail = await oTemplates.save({ validateBeforeSave: false });
                    if (isRateExtendMode == 'true') {
                        const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, iMemberID: iMemberID, cScacCode: cSelectedMemebersModel, cUploadType: 'MEMBER_ADMIN_UPLOAD', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cAddtionalComment: cEmailText, isRateExtendMode, memberFilePath };
                        let cEmail = this._oCommonCls.FunDCT_getEmail();
                        let oEmailTemplateDetails;
                        let iDefaultSubject;
                        let cEmailList;
                        // var cQueryUsing: any = {};
                        // cQueryUsing["cEmailType"] = 'RATE_EXTENDED';
                        // oEmailTemplateDetails = await GenEmailtemplates.find(cQueryUsing);
                        // if (oEmailTemplateDetails && oEmailTemplateDetails.length > 0) {
                        //     iDefaultSubject = oEmailTemplateDetails[0].cSubject;

                        let oEmailTemplateList;
                        if (oTemplateDetails[0].oTemplateMetaDataListing.cEmailFrom && oTemplateDetails[0].oTemplateMetaDataListing.cEmailFrom.trim() !== '') {
                            oEmailTemplateList = await GenEmailtemplates.aggregate([
                                {
                                    $match: {
                                        cFrom: oTemplateDetails[0].oTemplateMetaDataListing.cEmailFrom.trim()
                                    }
                                },
                                {
                                    $lookup: {
                                        from: "gen_processes",
                                        localField: "iProcessID",
                                        foreignField: "_id",
                                        as: "oProcessListing"
                                    }
                                },
                                { $unwind: "$oProcessListing" },
                                { $unwind: "$oProcessListing.cProcessCode" },
                                {
                                    $match: {
                                        "oProcessListing.cProcessCode": "RATE_EXTEND"
                                    }
                                }
                            ]);
                        }
                        let oEmailTemplateDetailList = oEmailTemplateList[0];
                        this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();

                        if (oEmailTemplateDetailList) {
                            this._oEmailTemplateCls.FunDCT_SetEmailTemplateID('');
                        }


                        // cQueryUsing["cEmailType"] = 'RATE_EXTENDED';
                        // oEmailTemplateDetails = await GenEmailtemplates.find(cQueryUsing);
                        if (oEmailTemplateDetailList && oEmailTemplateDetailList.cSubject) {
                            iDefaultSubject = oEmailTemplateDetailList.cSubject;
                            cEmailList = cEmail + ',' + cMemberEmail;
                        }
                        const aVariablesVal = {
                            DCTVARIABLE_TEMPLATENAME: aRequestDetails.cTemplateName,
                            DCTVARIABLE_ADDITIONALEMAILBODY: aRequestDetails.cAddtionalComment,
                        };
                        this._oEmailTemplateCls.FunDCT_SetSubject(aVariablesVal.DCTVARIABLE_TEMPLATENAME + ' (' + iDefaultSubject + ')') //oEmailTemplateDetails[0].cSubject
                        await this._oEmailTemplateCls.FunDCT_SendNotification('RATE_EXTEND', oEmailTemplateDetailList.cEmailType, aVariablesVal, cEmailList);
                    }
                    await this.clsDCT_ManageTemplate.addUpdateDataIntoGenLaneAndGenLaneSchedule(cTemplateType, event.requestContext.authorizer._id, memTmplUploadLogDetail)

                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'UPLOAD_TEMPLATE', 'TEMPLATE_REQUEST_SUBMITTED', 200, oTemplates);
                }
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err.message);
        }
    }
}
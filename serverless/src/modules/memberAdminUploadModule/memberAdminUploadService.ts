import { validationResult } from "express-validator";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../../models/MemTmplUploadLog";
import Status, { IStatus } from "../../models/GenStatus";
import GenMember, { IMember } from "../../models/GenMember";
import TmplUploadLog from "../../models/Tmpluploadlog";
var mongoose = require('mongoose')
import path from 'path';
import GenEmailtemplates from "../../models/GenEmailtemplates";
import { ClsDCT_EmailTemplate } from "../../commonModule/Class.emailtemplate";
import { ClsDCT_ManageTemplate } from "../../commonModule/Class.managetemplate";

const AdmZip = require('adm-zip');



export class MemberAdminUploadService {
    private _oCommonCls = new ClsDCT_Common();
    private _oEmailTemplateCls = new ClsDCT_EmailTemplate();
    private clsDCT_ManageTemplate = new ClsDCT_ManageTemplate()

    public memberAdminUploadTemplate = async (formData, event) => {
        try {
            let oFileStream: any;
            let _cFileTypeUploadTemplate: any;
            const errors = validationResult(event);
            if (!errors.isEmpty()) {
                return (event
                    .status(HttpStatusCodes.BAD_REQUEST)
                    .json({ errors: errors.array() }))
            }
            let { iTemplateID, cUploadType, cTemplateType, cSelectedMemebersModel, cEmailText, aTemplateFileName, aTemplateFileSize, isRateExtendMode } = formData;//cEmailText code added by spirgonde for additional file upload task
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
            } else {
                let oStatus;
                try {
                    oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
                } catch (error) {
                    throw new error
                }
                const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);
                if (true) {
                    let cMemberEmail;
                    let oMembersDetails = await GenMember.findOne({ cScac: cSelectedMemebersModel }).lean() as IMember;
                    if (oMembersDetails) {
                        cMemberEmail = oMembersDetails.cEmail;
                    }
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
                        } catch (error) {
                            this._oCommonCls.log('Something went wrong while uploading profile Image! ' + error);
                        }
                    } else {
                        cAddtionalFile = "not Provided at the time of Template upload";
                    }
                    formData.cAdditionalFiles = [];
                    const oMemberDetails = await this._oCommonCls.FunDCT_SetMemberDetailsByScac(cSelectedMemebersModel);
                    let iMemberID = this._oCommonCls.FunDCT_GetMemberID();

                    //req._id replaced to iMemberID
                    const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, iMemberID: iMemberID, cScacCode: cSelectedMemebersModel, cTemplateFile: cRenamedFile, iActiveStatus: 0, cUploadType: 'MEMBER_ADMIN_UPLOAD', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cAddtionalFile: cAddtionalFile, cAddtionalComment: cEmailText, aTemplateFileName, aTemplateFileSize, isRateExtendMode };
                    let oTemplates = new MemTmplUploadLog(aRequestDetails);
                    let memTmplUploadLogDetail = await oTemplates.save({ validateBeforeSave: false });
                    if (isRateExtendMode == 'true') {
                        const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, iMemberID: iMemberID, cScacCode: cSelectedMemebersModel, cUploadType: 'MEMBER_ADMIN_UPLOAD', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cAddtionalComment: cEmailText, isRateExtendMode, memberFilePath };
                        let cEmail = this._oCommonCls.FunDCT_getEmail();
                        let oEmailTemplateDetails;
                        let iDefaultSubject;
                        let cEmailList;
                        var cQueryUsing: any = {};
                        cQueryUsing["cEmailType"] = 'RATE_EXTENDED';
                        oEmailTemplateDetails = await GenEmailtemplates.find(cQueryUsing);
                        if (oEmailTemplateDetails && oEmailTemplateDetails.length > 0) {
                            iDefaultSubject = oEmailTemplateDetails[0].cSubject;
                            cEmailList = cEmail + ',' + cMemberEmail;
                        }
                        const aVariablesVal = {
                            DCTVARIABLE_TEMPLATENAME: aRequestDetails.cTemplateName,
                            DCTVARIABLE_ADDITIONALEMAILBODY: aRequestDetails.cAddtionalComment,
                        };
                        this._oEmailTemplateCls.FunDCT_SetSubject(aVariablesVal.DCTVARIABLE_TEMPLATENAME + ' (' + iDefaultSubject + ')') //oEmailTemplateDetails[0].cSubject
                        await this._oEmailTemplateCls.FunDCT_SendNotification('MEMBER_ADMIN_UPLOAD', 'RATE_EXTENDED', aVariablesVal, cEmailList);
                    }
                    await this.clsDCT_ManageTemplate.addUpdateDataIntoGenLaneAndGenLaneSchedule(cTemplateType, event.requestContext.authorizer._id, memTmplUploadLogDetail)
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'UPLOAD_TEMPLATE', 'TEMPLATE_UPLOADED', 200, aRequestDetails);
                }
            }
        } catch (error) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, error);
        }
    }
}
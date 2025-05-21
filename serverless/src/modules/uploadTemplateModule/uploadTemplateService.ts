import { ClsDCT_Common } from "../../commonModule/Class.common";
import moment from 'moment';
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";
import Status, { IStatus } from "../../models/GenStatus";
import HttpStatusCodes from "http-status-codes";
import TmplUploadLog, { ITmplUploadLog } from "../../models/Tmpluploadlog";
import TemplateType from "../../models/GenTemplateType";
import GenLane from "../../models/GenLane";
import { ClsDCT_ManageTemplate } from "../../commonModule/Class.managetemplate";
import GenLaneSchedule from "../../models/GenLaneSchedule";
import { ClsDCT_EmailTemplate } from "../../commonModule/Class.emailtemplate";
import GenEmailtemplates, { IEmailtemplates } from "../../models/GenEmailtemplates";
import Template from "../../models/GenTemplate";
import GenMember, { IMember } from "../../models/GenMember";
const AdmZip = require('adm-zip');



export class UploadTemplateService {
    private _oCommonCls = new ClsDCT_Common();
    private _oEmailTemplateCls = new ClsDCT_EmailTemplate();


    private clsDCT_ManageTemplate = new ClsDCT_ManageTemplate()

    public uploadTemplate = async (formData, event) => {
        try {
            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- Start')
            const { iTemplateID, tCuttoffdate, cSelectedMembers, cEmailSubject, cEmailFrom, cEmailTemplateID, cEmailText, cAdditionalEmail, cUploadType, cTemplateType, aTemplateFileName, aTemplateFileSize, startHeaderRowIndex } = formData;
            const aReqDetails = { iTemplateID, tCuttoffdate, cSelectedMembers, cEmailSubject, cEmailFrom, cEmailTemplateID, cEmailText, cAdditionalEmail, cUploadType, aTemplateFileName, aTemplateFileSize, startHeaderRowIndex }
            var tNow = new Date(tCuttoffdate);
            const tCutoffConverted: string = moment(tNow).format('YYYY-MM-DD HH:mm:ss');
            const aTmplMetaData = { iTemplateID, tCuttoffdate: tCutoffConverted, cEmailSubject, cEmailFrom, cEmailTemplateID, cEmailText, cAdditionalEmail, startHeaderRowIndex }
            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- aTmplMetaData')
            let oTemplate = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
            if (oTemplate) {
                this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- oTemplate')
                oTemplate = await TmplMetaData.findOneAndUpdate(
                    { iTemplateID: iTemplateID },
                    { $set: aTmplMetaData },
                    { new: true }
                ).lean() as ITmplMetaData;
            }

            let oStatus;
            try {
                oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            } catch (error) {
                throw new Error(error);
            }

            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- Before File')
            let cRenamedFile = await this._oCommonCls.FunDCT_UploadProfileImage(formData.aTemplateFileInfo.content, this._oCommonCls.cAWSBucket + '/templates/uploadtemplate/interteam/' + 'UPLOAD_TEMPLATE-' + iTemplateID + '-' + Date.now() + formData.aTemplateFileInfo.filename.substring(formData.aTemplateFileInfo.filename.lastIndexOf('.'), formData.aTemplateFileInfo.filename.length));
            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- After File')
            let cAddtionalFile;
            if (formData?.cAdditionalFiles?.length > 0) {
                this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- filePathArray')

                const zip = new AdmZip();

                // Add each file buffer to the ZIP
                formData?.cAdditionalFiles?.forEach((file) => {
                    zip.addFile(file.filename + '_' + Date.now() + file.filename.substring(file.filename.lastIndexOf('.'), file.filename.length), file.content);
                });
                const zipBuffer = zip.toBuffer();
                const zipPath = `${this._oCommonCls.cDirTemplateInterTeamUploadTemplate}${iTemplateID}_UploadTemplate_AdditionalFile_${Date.now()}.zip`;

                try {
                    let type = "interteam";
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

            const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);

            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- oTemplateDetails')
            const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, cTemplateFile: cRenamedFile, iActiveStatus: 0, tCuttoffdate, cSelectedMembers: JSON.parse(cSelectedMembers), cUploadType: 'DISTRIBUTE', bProcesslock: 'N', cEmailSubject, cEmailFrom, cEmailText, cAdditionalEmail, iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cAddtionalFile: cAddtionalFile, aTemplateFileName, aTemplateFileSize, startHeaderRowIndex };
            let oTemplates = new TmplUploadLog(aRequestDetails);
            const tmplUploadLogDetail = await oTemplates.save();
            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- oTemplates.save')
            await this.clsDCT_ManageTemplate.addUpdateDataIntoGenLaneAndGenLaneSchedule(cTemplateType, event.requestContext.authorizer._id, tmplUploadLogDetail)
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'UPLOAD_TEMPLATE', 'TEMPLATE_REQUEST_SUBMITTED', 200, oTemplates);
        } catch (err) {
            this._oCommonCls.log(err)
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public updateStatDocument = async (event) => {
        try {
            const body = JSON.parse(event.body);
            //let oStatData = await TmplMetaData.findOne({ _id: mongoose.Types.ObjectId(req.params.iTemplateMetaDataID)}).lean();
            let oStatData = await TmplMetaData.findById(body.iTemplateMetaDataID);
            let oMemberEmail: any;
            if (oStatData) {

                let oEmailTemplateList;
                if (oStatData.cEmailFrom && oStatData.cEmailFrom.trim() !== '') {
                    oEmailTemplateList = await GenEmailtemplates.aggregate([
                        {
                            $match: {
                                cFrom: oStatData.cEmailFrom.trim()
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
                                "oProcessListing.cProcessCode": "REVISE_CUTOFF"
                            }
                        }
                    ]);
                }
                let oEmailTemplateDetailList = oEmailTemplateList[0];

                this._oEmailTemplateCls.FunDCT_ResetEmailTemplate();
                if (oEmailTemplateDetailList) {
                    this._oEmailTemplateCls.FunDCT_SetEmailTemplateID('');
                }

                let aMemberScac = body.aMemberScac;
                let oTemplateMeta = await TmplMetaData.findOne({ _id: body.iTemplateMetaDataID }).lean() as ITmplMetaData;
                let oTemplate = await Template.findOne({ _id: oTemplateMeta?.iTemplateID }).lean() as any;
                let cTemplateName = oTemplate?.cTemplateName;
                let tCuttoffdate = body.tUpdatedCuttoffDate;
                var tNow = new Date(tCuttoffdate);
                const tCutoffConverted: string = moment(tNow).format('YYYY-MM-DD HH:mm:ss');//changed hh to HH by spirgonde
                let tUpdatedCuttoffDate = tCutoffConverted;
                let data = "aMemberCutoffs." + aMemberScac + ".0.tCuttoffdate";
                let oMembersList = await GenMember.findOne({ cScac: aMemberScac }).lean() as IMember;
                if (oMembersList) {
                    oMemberEmail = oMembersList?.cEmail;
                }
                oStatData = await TmplMetaData.findByIdAndUpdate(body.iTemplateMetaDataID,
                    { $set: { [data]: tUpdatedCuttoffDate } },
                    { new: true }
                );

                let aVariablesVal = {
                    iTemplateID: body.iTemplateID,
                    cTemplateName: body.cTemplateName,
                    tCuttoffdate: body.tCuttoffdate,
                    aMemberCutoffs: body.aMemberCutoffs,
                    aMemberScac: body.aMemberScac,
                    cEmailFrom: body.cEmailFrom,
                    cAdditionalEmail: body.cAdditionalEmail ? body.cAdditionalEmail : null,
                    optionSendMail: body.optionSendMail,
                    oMemberEmail,
                    DCTVARIABLE_MEMBERNAME: aMemberScac,
                    DCTVARIABLE_TEMPLATENAME: cTemplateName,
                    DCTVARIABLE_TCUTOFFDATEMEMBER: tCuttoffdate,
                    oEmailTemplateDetailList
                }

                await this.FunDCT_SendMail(aVariablesVal);
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'CUTOFF_UPDATED', 200, oStatData);
            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error in Rescheule cutoff');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }


    async FunDCT_SendMail(data) {
        if (data.optionSendMail == 'SendMailToRFQTeamOnly') {
            await this._oEmailTemplateCls.FunDCT_SendNotification('REVISE_CUTOFF', data.oEmailTemplateDetailList.cEmailType, data, data.cEmailFrom);
        }
        else if (data.optionSendMail == 'SendMailToAllMember') {
            data.DCTVARIABLE_MEMBERNAME = data.aMemberScac;
            await this._oEmailTemplateCls.FunDCT_SendNotification('REVISE_CUTOFF', data.oEmailTemplateDetailList.cEmailType, data, data.oMemberEmail);
            if (data.cAdditionalEmail == null || data.cAdditionalEmail == '') { }
            else {
                await this._oEmailTemplateCls.FunDCT_SendNotification('REVISE_CUTOFF', data.oEmailTemplateDetailList.cEmailType, data, data.cAdditionalEmail);
            }
        }
    }

}
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
const AdmZip = require('adm-zip');



export class UploadTemplateService {
    private _oCommonCls = new ClsDCT_Common();

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
                    let response = await this._oCommonCls.FunDCT_UploadS3File(zipPath, zipBuffer, type);
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
            await oTemplates.save();
            this._oCommonCls.log('"FunDCT_SaveUploadTemplate --- oTemplates.save')

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
                        iUpdatedby: event.requestContext.authorizer._id, // Update on modify
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
                        iEnteredby: event.requestContext.authorizer._id,
                        tEntered: new Date()
                    }
                };
            }
            const options = { upsert: true, new: true };
            await GenLane.findOneAndUpdate(query, update, options);
            const jDumpDetails = await this.clsDCT_ManageTemplate.getJDumpDetails(templateTypeDetails[0]._id)
            console.log("jDumpDetails======>" ,jDumpDetails);
            await GenLaneSchedule.insertMany(jDumpDetails)


            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'UPLOAD_TEMPLATE', 'TEMPLATE_REQUEST_SUBMITTED', 200, oTemplates);
        } catch (err) {
            this._oCommonCls.log(err)
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }


}
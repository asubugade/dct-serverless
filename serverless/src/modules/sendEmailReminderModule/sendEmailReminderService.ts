import { ClsDCT_Common } from "../../commonModule/Class.common";
import moment from 'moment';
import Template from "../../models/GenTemplate";
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";
import GenMember, { IMember } from "../../models/GenMember";
import { ClsDCT_EmailTemplate } from '../../commonModule/Class.emailtemplate';
import HttpStatusCodes from "http-status-codes";


export class SendEmailReminderService {
    private _oCommonCls = new ClsDCT_Common();
    private _oEmailTemplateCls = new ClsDCT_EmailTemplate();


    public sendEmailReminder = async (event) => {
        try {
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];

            if (cToken) {
                await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            }
            this._oCommonCls.FunDCT_ApiRequest(event)
            var tNow = moment()

            const { iTemplateID, cTemplateType, cEmailSubject, cEmailFrom, cEmailTemplateID, cEmailText, cEmailType } = JSON.parse(event.body);
            const aReqDetails = { iTemplateID, cTemplateType, cEmailSubject, cEmailFrom, cEmailTemplateID, cEmailText, cEmailType }
            let aMappedScacColumnsStat;
            let aMemberCutoffs;
            let tCuttoffdate;
            let cTemplateName;
            let oEmailTemplateDetails;

            let oTemplateMetaData = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
            let oTemplate = await Template.findOne({ _id: iTemplateID });
            // if (cEmailTemplateID) {
            //   oEmailTemplateDetails = await GenEmailtemplates.find({_id : new mongoose.Types.ObjectId(cEmailTemplateID)})
            // }
            if (oTemplateMetaData && oTemplate) {
                aMappedScacColumnsStat = oTemplateMetaData.aMappedScacColumnsStat;
                aMemberCutoffs = oTemplateMetaData.aMemberCutoffs;
                tCuttoffdate = oTemplateMetaData.tCuttoffdate;
                cTemplateName = oTemplate.cTemplateName;

                const currentDate = moment();
                let remainingMember = Object.keys(aMemberCutoffs).flatMap((memberKey: string) => {
                    const cutoffArray = aMemberCutoffs[memberKey];
                    return cutoffArray.filter((cutoff: any) => {
                        const cutoffDate = moment(cutoff.tCuttoffdate);
                        return cutoffDate > currentDate;
                    }).map((cutoff: any) => ({
                        memberKey: memberKey,
                        tCuttoffdate: cutoff.tCuttoffdate
                    }));
                });

                let mScacColumnsStat: { [key: string]: any } = {};
                if (remainingMember.length > 0) {
                    const stats = aMappedScacColumnsStat;
                    for (const memberObj of remainingMember) {
                        const member = memberObj.memberKey;
                        const cutoffDate = memberObj.tCuttoffdate;
                        const stat = stats[member];
                        if (stat) {
                            for (const entry of stat) {
                                for (const key in entry) {
                                    if (entry[key].iTotalLanes > entry[key].iSubmittedLanes) {
                                        if (!mScacColumnsStat[member]) {
                                            mScacColumnsStat[member] = {};
                                        }
                                        mScacColumnsStat[member][key] = {
                                            iTotalLanes: entry[key].iTotalLanes,
                                            iSubmittedLanes: entry[key].iSubmittedLanes,
                                            iRemainingLanes: entry[key].iRemainingLanes,
                                        };
                                    }
                                    if (mScacColumnsStat[member]) {
                                        mScacColumnsStat[member].tCuttoffdate = cutoffDate;
                                    }
                                }
                            }
                        }
                    }
                }

                const aMemberScac = Object.keys(mScacColumnsStat);
                let oMemberName;
                let oMemberEmail;
                const oMembersList: any = [];

                for (const scac of aMemberScac) {
                    const oMember = await GenMember.findOne({ cScac: scac }).lean() as IMember;
                    if (oMember) {
                        oMemberName = oMember.cScac;
                        oMemberEmail = oMember.cEmail;
                        oMembersList.push({ oMemberName, oMemberEmail });

                        let aVariablesVal = {
                            DCTVARIABLE_MEMBERNAME: scac,
                            DCTVARIABLE_TEMPLATENAME: cTemplateName,
                            DCTVARIABLE_TCUTOFFDATEMEMBER: mScacColumnsStat[scac].tCuttoffdate,
                            DCTVARIABLE_ADDITIONALEMAILBODY: cEmailText,
                        }
                        this._oEmailTemplateCls.FunDCT_SetSubject(cEmailSubject);
                        // let cEmailType = oEmailTemplateDetails[0].cEmailType
                        await this._oEmailTemplateCls.FunDCT_SendNotification('SEND_REMINDER_EMAIL', cEmailType, aVariablesVal, oMemberEmail);

                    }
                }

                // return res.status(HttpStatusCodes.OK).json({ cMessage: "Reminder has been sent to user." });
                return {
                    statusCode: HttpStatusCodes.OK,
                    body: JSON.stringify({ cMessage: "Reminder has been sent to user." }),
                };
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error in sending reminder');
            }
        }
        catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: err.message || "Internal Server Error" }),
            };
        }
    }
}
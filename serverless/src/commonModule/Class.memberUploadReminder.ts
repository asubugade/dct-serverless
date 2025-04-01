import { ClsDCT_ConfigIntigrations } from '../config/config';
import Template, { ITemplate } from "../models/GenTemplate";
import { ClsDCT_EmailTemplate } from "./Class.emailtemplate";
import ReminderEmailFrequency, { IReminderEmailFrequency } from "../models/ReminderEmailFrequency"
import Status, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";
import TmplMetaData, { ITmplMetaData } from "../models/Tmplmetadata";
import GenProcess, { IProcess } from "../models/GenProcess"
import { ClsDCT_Common } from "./Class.common";

export class ClsDCT_MemberUploadReminder extends ClsDCT_Common {
    public oUserData;

    constructor() {
        super();
    }

    /**
     * Function to get template name
     * @param iTemplateID any
     * @returns any
     */
    public async FunDCT_GetTemplateNameByID(iTemplateID: any) {
        try {
            let oTemplate = await Template.find({ _id: iTemplateID }).select('cTemplateName');
            for (const [key, value] of Object.entries(oTemplate)) {
                let cTemplateName: string = Object(value)["cTemplateName"];
                return cTemplateName;
            }
        } catch (err) {
            return false;
        }
    }

    /**
     * 
     * @param cFrom any
     */
    public async FunDCT_ReminderMemberUploadFunction(cFrom) {
        try {
            cFrom = cFrom;
            var aReminderEmail = [];
            let oUserData = await User.find({});
            let oTmplMetaData = await TmplMetaData.find({});

            for (let i = 0; i < oTmplMetaData.length; i++) {
                let oTemplateName: any = await this.FunDCT_GetTemplateNameByID(oTmplMetaData[i]['iTemplateID']);
                const cTemplateName = oTemplateName.cTemplateName;

                if (oTmplMetaData[i]['aMemberCutoffs']) {

                    for (let member of Object.keys(oTmplMetaData[i]['aMemberCutoffs'])) {
                        let memberObject = oTmplMetaData[i]['aMemberCutoffs'][member];
                        for (const [key, value] of Object.entries(memberObject)) {
                            let cMemberScac = member; let cutofdate = Object(value)["tCuttoffdate"];
                            let tCuttoffdateMember = new Date(cutofdate); let todaysDate = new Date();
                            if (todaysDate < tCuttoffdateMember) {
                                let oChargeLane: any;
                                oChargeLane = this.FunDCT_GetaMappedScacColumnsStat(oTmplMetaData[i]['aMappedScacColumnsStat'], cMemberScac);
                                if (oChargeLane.length > 0) {
                                    let aMemberDetails = {
                                        cMemberScac: cMemberScac,
                                        tCuttoffdateMember: tCuttoffdateMember,
                                        oChargeLane: oChargeLane
                                    };
                                    aReminderEmail.push(aMemberDetails);
                                    this.FunDCT_GenerateEmail(aReminderEmail, oUserData, cFrom, cTemplateName);
                                }
                                aReminderEmail = []; // clear the array after sending mail for current user 
                            }
                        }
                    }
                }
            }

            //code added by spirgonde to solve cron delay task end .



        } catch (err) {
            return false;
        }
    }

    /**
     * Function  to create data for each member , get email id of that member and call sendMail () .
     * @param aReminderEmail any
     * @param oUserData any
     * @param cFrom any
     * @param cTemplateName any
     */
    public async FunDCT_GenerateEmail(aReminderEmail: any, oUserData: any, cFrom: any, cTemplateName: any) {
        try {
            cFrom = cFrom; cTemplateName = cTemplateName; let tCuttoffdateMember;
            var chargeLaneString = ``; var cMemberScac: string;
            aReminderEmail.forEach(function (member) {
                tCuttoffdateMember = member.tCuttoffdateMember;
                cMemberScac = member.cMemberScac;
                member.oChargeLane.forEach(element => {
                    chargeLaneString = `${chargeLaneString}\n
                ${element.cCharge} Remaining : ${element.iRemainingLanes},`;
                });
            })
            chargeLaneString = chargeLaneString.slice(0, -1) //code to remove last , 

            Object.keys(oUserData).forEach(async (cKey) => {
                if (oUserData[cKey]['cCompanyname'] == cMemberScac && chargeLaneString != '') {
                    await this.FunDCT_SendReminderMail(cMemberScac, cTemplateName, tCuttoffdateMember, oUserData[cKey]['cEmail'], chargeLaneString, cFrom); //comment if testing and dont want to send mail
                }
            });
            // oUserData.forEach(async function (user) {
            //     if (user.cCompanyname == cMemberScac) {
            //         await this.SendReminderMail(cMemberScac, cTemplateName, tCuttoffdateMember, user.cEmail, chargeLaneString, cFrom); //comment if testing and dont want to send mail
            //     }
            // })
        } catch (err) {
            return false;
        }
    }

    /**
     * this Function is actually used to send Mail to each member
     * @param cMemberScac any
     * @param cTemplateName any
     * @param tCuttoffdateMember any
     * @param cUserEmail any
     * @param cChargeLaneStr any
     * @param cFrom any
     */
    public async FunDCT_SendReminderMail(cMemberScac: any, cTemplateName: any, tCuttoffdateMember: any, cUserEmail: any, cChargeLaneStr: any, cFrom: any) {
        try {
            cFrom = cFrom;
            var aVariablesVal = {
                DCTVARIABLE_USERNAME: cMemberScac,
                DCTVARIABLE_TEMPLATENAME: cTemplateName,
                DCTVARIABLE_CHARGEANDLANE: cChargeLaneStr,
                DCTVARIABLE_TCUTOFFDATEMEMBER: tCuttoffdateMember
            };

            let _oEmailTemplateCls = new ClsDCT_EmailTemplate();
            await _oEmailTemplateCls.FunDCT_SendNotification('MEMBER_UPLOAD', 'MEMBER_UPLOAD_REMINDER', aVariablesVal, cUserEmail)
        } catch (err) {
            return false;
        }
    }

    /**
     * This Function is used to calculate RemainingLanes that needs to be submitted
     * @param aMappedScacColumnsStat any
     * @param cMemberScac any
     * @returns object
     */
    public async FunDCT_GetaMappedScacColumnsStat(aMappedScacColumnsStat: any, cMemberScac: any) {
        try {
            var oChargeLane = [];
            let oMemberDetails = {
                cMemberScac: cMemberScac,
                cCharge: String,
                remainingLanes: Number
            };
            for (let cMemberKey of Object.keys(aMappedScacColumnsStat)) {
                if (cMemberKey == cMemberScac) {
                    let oMemberDetailsObj = aMappedScacColumnsStat[cMemberKey];
                    const [cKey, cVal] = Object.values(oMemberDetailsObj);
                    for (const [cCharge, lanes] of Object.entries(cKey)) {
                        let iTotalLanes = Object(lanes)["iTotalLanes"];
                        let iSubmittedLanes = Object(lanes)["iSubmittedLanes"];
                        let iRemainingLanes = iTotalLanes - iSubmittedLanes;
                        if (iRemainingLanes != 0) {
                            let oMemberDetails = {
                                cCharge: cCharge,
                                iRemainingLanes: iRemainingLanes
                            };
                            oChargeLane.push(oMemberDetails);
                        }
                    }
                }
            }
            return oChargeLane;
        } catch (err) {
            return false;
        }
    }

    /**
    * Function to send reminder email
    */
    public async FunDCT_ReminderFrequencyEmail() {
        try {
            //code added by spirgonde to solve cron delay task start ...

            let activeID: String;
            let oMailOption = await ReminderEmailFrequency.find({});
            let oStatus = await Status.find({ cStatusCode: 'ACTIVE' }
            // , function (err, obj) {
            //     activeID = String(obj[0].toObject()._id)
            // }
            );//Call back removed
            activeID = String(oStatus[0].toObject()._id)//added by Asif to change in call bck
            

            let today = new Date();
            let hour = today.getHours();
            let minute = today.getMinutes();
            let timeElapsed = (hour * 60) + minute;

            Object.keys(oMailOption).forEach(async (cKey) => {
                let tUpdated;
                if (oMailOption[cKey]['tUpdated'] != undefined) {
                    tUpdated = new Date(oMailOption[cKey]['tUpdated'])
                }
                else {
                    tUpdated = new Date(oMailOption[cKey]['tEntered']);
                }

                let iMailHour = tUpdated.getHours();
                let iMailMinute = tUpdated.getMinutes();
                let iSendMailAfter = (iMailHour * 60) + iMailMinute;
                let iDifferenece = Math.abs(iSendMailAfter - timeElapsed);
                if ((timeElapsed != 0) && (String(oMailOption[cKey]['iStatusID']) === activeID) && (iDifferenece % ((oMailOption[cKey]['iHour'] * 60) + oMailOption[cKey]['iMinute']) == 0)) {
                    let oProcess: IProcess = await GenProcess.findOne({ _id: oMailOption[cKey]['iProcessID'] });
                    if (oProcess.cProcessCode == "MEMBER_UPLOAD") {
                        let cFromMemberEmail: string;
                        cFromMemberEmail = oMailOption[cKey]['cFrom'];
                        await this.FunDCT_ReminderMemberUploadFunction(cFromMemberEmail);//to send email reminder for process 'MEMBER UPLOAD'
                    }
                }
            });
        } catch (err) {
            return false;
        }
    }
}
export default new ClsDCT_MemberUploadReminder();
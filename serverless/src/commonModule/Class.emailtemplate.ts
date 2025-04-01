import { ClsDCT_ConfigIntigrations } from '../../config/config';
import { ClsDCT_Process } from '../commonModule/Class.process';

import GenEmailtemplates, { IEmailtemplates } from "../models/GenEmailtemplates";
import nodemailer from 'nodemailer';
import Mail = require('nodemailer/lib/mailer');
import handlebars, { logger } from 'handlebars';
import { ClsDCT_Common } from './Class.common';
import { isValidObjectId } from 'mongoose';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
var mongoose = require('mongoose')


export class ClsDCT_EmailTemplate {
    public iProcessID: any;
    public cEmailType: string;
    public cSubject: string;
    public cFromEmailText: any;//added by jraisoni
    public cEmailBody: any;
    public cFrom: any;
    public cTo: any;
    public cBcc: string;
    public cCc: string;
    public cNotificationEmail ;
    public cNotificationEmailpPwd ;
    public cEmailService;
    public cEmailHost;
    public iEmailPort;

    private _oProcessCls = new ClsDCT_Process();
    
    /**code added by spirgonde for  'Concurrent connections limit exceeded' issue start... */
    private _oCommonCls = new ClsDCT_Common();
    public oTransporter; 
    cProcessCode: string;
    public objEmailTemplateID;
    /**code added by spirgonde for  'Concurrent connections limit exceeded' issue end. */

    /**
     * Constructor
     */
    constructor() {
        this.FunDCT_localConfig();
        this.FunDCT_secretConfig();
    }
    
  private async FunDCT_localConfig(){
    if (this._oCommonCls.cNodeEnv == "Local") {
        this.cNotificationEmail =""+this._oCommonCls.cNotificationEmail;
        this.cNotificationEmailpPwd =""+this._oCommonCls.cNotificationEmailPwd;
        this.cEmailService = ""+this._oCommonCls.cEmailService;
        this.cEmailHost = ""+this._oCommonCls.cEmailHost;
        this.iEmailPort = Number(""+this._oCommonCls.cEmailPort);
        this._oCommonCls.FunDCT_setUserID('0001')
        this._oCommonCls.FunDCT_ApiRequest({baseUrl:'/API/EMAILTEMPLATE/'})
        this.FunDCT_CreateTransporter();
    }
  }

  private async FunDCT_secretConfig(){
    if (process.env.NODE_ENV == "Server") {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const response = await client.send(
        new GetSecretValueCommand({
        SecretId: process.env.SECRET_NAME,
        }),
      );
      if (response) {
        const dataString = JSON.parse(response.SecretString);
        this.cNotificationEmail =""+dataString.NOTIFICATION_EMAIL;
        this.cNotificationEmailpPwd =""+dataString.NOTIFICATION_EMAIL_PWD;
        this.cEmailService = ""+dataString.NOTIFICATION_EMAIL_SERVICE;
        this.cEmailHost = ""+dataString.NOTIFICATION_EMAIL_HOST;
        this.iEmailPort = Number(""+dataString.NOTIFICATION_EMAIL_PORT);
        this._oCommonCls.FunDCT_setUserID('0001')
        this._oCommonCls.FunDCT_ApiRequest({baseUrl:'/API/EMAILTEMPLATE/'})
        this.FunDCT_CreateTransporter();
      }
    }
  }

    /**
     * To get iProcessID
     */
    public FunDCT_GetProcessID() {
        return this.iProcessID;
    }

    /**
     * To set iProcessID
     * @param iProcessID string
     */
    public FunDCT_SetProcessID(iProcessID: string) {
        this.iProcessID = iProcessID;
    }

    /**
     * To get cEmailType
     */
    public FunDCT_GetEmailType() {
        return this.cEmailType;
    }

    /**
     * To set cEmailType
     * @param cEmailType string
     */
    public FunDCT_SetEmailType(cEmailType: string) {
        this.cEmailType = cEmailType;
    }

    /**
     * To get cSubject
     */
    public FunDCT_GetSubject() {
        return this.cSubject;
    }

    /**
     * To set cSubject
     * @param cSubject string
     */
    public FunDCT_SetSubject(cSubject: string) {
        this.cSubject = cSubject;
    }

    //added by jraisoni
    /**
     * To get cFromEmailText
     */
    public FunDCT_GetFromEmailText() {
        return this.cFromEmailText;
    }

    /**
     * To set cFromEmailText
     * @param cFromEmailText string
     */
    public FunDCT_SetFromEmailText(cFromEmailText: string) {
        this.cFromEmailText = cFromEmailText;
    }


    /**
     * To get cSubject
     */
    public FunDCT_GetTo() {
        return this.cTo;
    }

    /**
     * To set cTo
     * @param cTo string
     */
    public FunDCT_SetTo(cTo: string) {
        this.cTo = cTo;
    }

    /**
     * To get cEmailBody
     */
    public FunDCT_GetEmailBody() {
        return this.cEmailBody;
    }

    /**
     * To set cEmailBody
     * @param cEmailBody string
     */
    public FunDCT_SetEmailBody(cEmailBody: string) {
        this.cEmailBody = cEmailBody;
    }

    /**
     * To get cFrom
     */
    public FunDCT_GetFrom() {
        return this.cFrom;
    }

    /**
     * To set cFrom
     * @param cFrom string
     */
    public FunDCT_SetFrom(cFrom: string) {
        this.cFrom = cFrom;
    }

    /**
     * To get cBcc
     */
    public FunDCT_GetBcc() {
        return this.cBcc;
    }

    /**
     * To set cBcc
     * @param cBcc string
     */
    public FunDCT_SetBcc(cBcc: string) {
        this.cBcc = cBcc;
    }

    /**
     * To get cCc
     */
    public FunDCT_GetCc() {
        return this.cCc;
    }

    /**
     * To set cCc
     * @param cCc string
     */
    public FunDCT_SetCc(cCc: string) {
        this.cCc = cCc;
    }

    /**
     * To reset Email Template
     */
    public async FunDCT_ResetEmailTemplate() {
        this.iProcessID = '';
        this.cEmailType = '';
        this.cSubject = '';
        this.cFromEmailText = '';//added by jraisoni
        this.cEmailBody = '';
        this.cFrom = '';
        this.cTo = '';
        this.cBcc = '';
        this.cCc = '';

        return true
    }

    /**
     * To set Template Details according to template
     */
    public async FunDCT_SetTemplateDetails() {
        try {
            var cQueryUsing: any = {};
            cQueryUsing["iProcessID"] = this.iProcessID;
            cQueryUsing["cEmailType"] = this.cEmailType;
            let oEmailTemplateDetails ; 
            if(this.objEmailTemplateID){
                oEmailTemplateDetails = await GenEmailtemplates.find({_id : new mongoose.Types.ObjectId(this.objEmailTemplateID)})
                }else{
                    oEmailTemplateDetails = await GenEmailtemplates.find(cQueryUsing);
                }
            if (oEmailTemplateDetails && oEmailTemplateDetails.length>0) {
                if (this.cSubject == '' || !this.cSubject) {
                    this.FunDCT_SetSubject(oEmailTemplateDetails[0].cSubject);
                }
                this.FunDCT_SetEmailBody(oEmailTemplateDetails[0].cEmailBody);
                if (this.cFrom == '') {
                    this.FunDCT_SetFrom(oEmailTemplateDetails[0].cFrom);
                }
                let ccArray = [];
                if (this.cCc){
                    if (!ccArray.includes(this.cCc)) {
                        ccArray.push(this.cCc);
                    }
                }
                if (oEmailTemplateDetails[0].cBcc) {
                    if (!ccArray.includes(oEmailTemplateDetails[0].cBcc)) {
                        ccArray.push(oEmailTemplateDetails[0].cBcc);
                    }
                }
                if (oEmailTemplateDetails[0].cFrom) {
                    if (!ccArray.includes(oEmailTemplateDetails[0].cFrom)) {
                        ccArray.push(oEmailTemplateDetails[0].cFrom);
                    }
                }
                this.FunDCT_SetCc(ccArray.join(','));
                // this.FunDCT_SetBcc(oEmailTemplateDetails[0].cBcc);
                if (this.cCc == '' || this.cCc == undefined) {
                    this.FunDCT_SetCc('');
                }
                return await oEmailTemplateDetails;
            }
        } catch (err) {
            return err;
        }
    }
    /**
     * To set EmailTempalteID 
     * @param ID
     */
    public FunDCT_SetEmailTemplateID(ID) {
        if(ID || ID==''){
            this.objEmailTemplateID = ID;
            return this.objEmailTemplateID;
        }
    }

    /**
     * To set Email configuration Details
     * @param cProcessCode string
     * @param cEmailType string 
     * @param cTo string
     * @returns 
     */
    async FunDCT_SetConfigurationDetails(cProcessCode: string, cEmailType: string, cTo: string) {
        this._oProcessCls = new ClsDCT_Process();
        await this._oProcessCls.FunDCT_SetProcessCode(cProcessCode);
        await this._oProcessCls.FunDCT_SetProcessDetails();
        this.FunDCT_SetProcessID(this._oProcessCls.iProcessID);
        this.FunDCT_SetEmailType(cEmailType);
        this.FunDCT_SetTo(cTo);
        const oEmailTemplateDetails = await this.FunDCT_SetTemplateDetails();
        return oEmailTemplateDetails;
    }

    /**
     * Send Email Notification using smtp.office365.com
     * @param aVariablesVal any
     * @returns 
     */
    async FunDCT_SendNotification(cProcessCode: string, cEmailType: string, aVariablesVal: any, cTo: string) {
        try {
            let oEmailTemplateDetails = await this.FunDCT_SetConfigurationDetails(cProcessCode, cEmailType, cTo);
            if (oEmailTemplateDetails) {
                
                let template = handlebars.compile(this.cEmailBody);
                if (aVariablesVal.DCTVARIABLE_ADDITIONALEMAILBODY || aVariablesVal.DCTVARIABLE_ADDITIONALEMAILBODY == '') {
                    handlebars.registerHelper("DCTVARIABLE_ADDITIONALEMAILBODY", function(options) {
                        return new handlebars.SafeString(aVariablesVal.DCTVARIABLE_ADDITIONALEMAILBODY);
                    });
                }
                if (aVariablesVal.DCTVARIABLE_INSTRUCTIONFILE_CONTENT || aVariablesVal.DCTVARIABLE_INSTRUCTIONFILE_CONTENT == '') {
                    handlebars.registerHelper("DCTVARIABLE_INSTRUCTIONFILE_CONTENT", function(options) {
                        return new handlebars.SafeString(aVariablesVal.DCTVARIABLE_INSTRUCTIONFILE_CONTENT);
                    });
                }
                const cFilteredEmailBody = template(aVariablesVal);
                const uniquecToEmails = Array.from(new Set(this.cTo.split(','))).join(',');
                const uniquecCcEmails = Array.from(new Set(this.cCc.split(','))).join(',');
                const uniquecBccEmails = Array.from(new Set(this.cBcc.split(','))).join(',');
                this.cTo = uniquecToEmails;
                this.cCc = uniquecCcEmails;
                this.cBcc = uniquecBccEmails;
                if (cFilteredEmailBody) {
                    return await this.sendMail({
                        // from: `WWA <${this.cNotificationEmail}>`,
                        from: `WWA <${this.cFrom}>`,
                        // from: this.cFrom,
                        to: cTo,
                        cc: this.cCc,
                        bcc: this.cBcc,
                        subject: this.cSubject,
                        html: cFilteredEmailBody,
                    });
                }

            }
        } catch (err) {
            this._oCommonCls.log('email error :'+ err);
            return err;
        }
    }

    /**
     * This Function was created to solve the issue of 'Concurrent connections limit exceeded' issue.This function contains code to 
     * create nodemailer transporter object . Whenever instance of this class is created this object will be initialised automatically
     * and only once through constructor.
     */
    async FunDCT_CreateTransporter() {
        this.oTransporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 1,
            maxMessages: 1,
            rateDelta: 3000,
            rateLimit: 1,
            service:this.cEmailService,  // check this parameter for staging
            host: this.cEmailHost,
            requireTLS: false,
            port: this.iEmailPort,
            secure: false, // check this parameter for staging
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            },
            auth: {
                user: this.cNotificationEmail,
                pass: this.cNotificationEmailpPwd
            },
        });
    }

    /**
     * To Send Email from office365 Node Mailer Transporter
     * @param mailOptions Mail.Options
     * @returns 
     */
    async sendMail(mailOptions: Mail.Options): Promise<nodemailer> {
        const transporter = this.oTransporter;
        await transporter.sendMail(mailOptions, function (err, responseStatus) {
            if (err) {
                this._oCommonCls.log('err:'+ err);
            }
            else {
            }
        });
        return
    }
}
export default new ClsDCT_EmailTemplate();
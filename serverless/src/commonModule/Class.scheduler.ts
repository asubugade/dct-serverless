/**
 * Class - Scheduler to schedule task (Crons)
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { CronJob } from 'cron';
import { ClsDCT_MemberUploadReminder } from './Class.memberUploadReminder'
import { ClsDCT_ManageTemplate } from './Class.managetemplate'
import { ClsDCT_ConsolidateTemplate } from './Class.consolidatetemplate'
import { ClsDCT_MemberSubmissionTemplate } from './Class.membersubmissiontemplate'
import { ClsDCT_Common } from "./Class.common";
export class ClsDCT_Scheduler extends ClsDCT_Common {
    public oCronJob: CronJob;
    public oEmailFrequency_MemberUpload = new ClsDCT_MemberUploadReminder();
    public oManageTemplate = new ClsDCT_ManageTemplate();
    public oConsolidateTemplate = new ClsDCT_ConsolidateTemplate();
    public oMemberSubmissionTemplate = new ClsDCT_MemberSubmissionTemplate()
    private _oCommonCls = new ClsDCT_Common()
    /**
     * Constructor
     */
    constructor() {
        super()
        // this.FunDCT_CallScheduleJobs();
        
    }


    /**
     * Function to get template name
     * @param iTemplateID any
     * @returns any
     */
     public async FunDCT_CallScheduleJobs() {
        try {
            this.oCronJob = new CronJob('0 */1 * * * *', async () => {
                try {
                    await this.oEmailFrequency_MemberUpload.FunDCT_ReminderFrequencyEmail();
                    await this.oManageTemplate.FunDCT_ValidateTemplateHeaderContent();
                    await this.oConsolidateTemplate.FunDCT_ConsolidateTemplate();
                    await this.oMemberSubmissionTemplate.FunDCT_MemberSubmissionTemplate();
                    await this.oConsolidateTemplate.FunDCT_AutogenerateConsolidation(); //code added by spirgonde for Autogenerate Consolidation report on template expired
                } catch (e) {
                    this._oCommonCls.error(e);
                }
            });
            if (!this.oCronJob.running) {
                this.oCronJob.start();
            }
        } catch (err) {
            this._oCommonCls.error(err)
            return false;
        }
    }
}
export default new ClsDCT_Scheduler();
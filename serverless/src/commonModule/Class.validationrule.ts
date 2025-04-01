import { ObjectId } from 'mongoose';
import { ClsDCT_ConfigIntigrations } from '../config/config';
import Message, { IMessage } from "../models/GenMessage";
import TemplateValidation, { ITemplateValidation } from "../models/GenTemplateValidation";

export class ClsDCT_ValidationRule {
    public cValidateRule: any;
    public cValidateRegex: any;
    public cValidateDescription: any;
    public oValidationsDetails: any;
    public cSelectedFields: string;

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * To get Fields
     */
    public FunDCT_getSelectedFields() {
        return this.cSelectedFields;
    }

    /**
     * To set cSelectedFields
     */
    public FunDCT_setSelectedFields(cSelectedFields: string) {
        this.cSelectedFields = cSelectedFields;
    }

    /**
     * To get cValidateRule:cValidateRule
     */
    public FunDCT_GetValidationRule() {
        return this.cValidateRule;
    }

    /**
     * To set cValidateRule:cValidateRule
     */
    public FunDCT_SetValidationRule(cValidateRule: string) {
        this.cValidateRule = cValidateRule;
    }

    /**
     * To get cValidateRegex:cValidateRegex
     */
    public FunDCT_GetValidateRegex() {
        return this.cValidateRegex;
    }

    /**
     * To set cValidateRegex:cValidateRegex
     */
    public FunDCT_SetValidateRegex(cValidateRegex: string) {
        this.cValidateRegex = cValidateRegex;
    }

    /**
     * To get cValidateDescription:cValidateDescription
     */
    public FunDCT_GetValidateDescription() {
        return this.cValidateDescription;
    }

    /**
     * To set cDescription:cDescription
     */
    public FunDCT_SetValidateDescription(cValidateDescription: string) {
        this.cValidateDescription = cValidateDescription;
    }

    /**
     * To get validation details based on 
     * cValidateRule, cValidateRegex, cDescription
     */
    public FunDCT_GetValidationRuleDetails() {
        return this.oValidationsDetails;
    }

    /**
     * To set validation details
     * aSelectFields:any[]
     */
    public async FunDCT_SetValidationRuleDetails(cUsing: string, aSelectFields: any) {
        try {
            let cColumn: string;
            switch (cUsing) {
                case 'cValidateRule': {
                    cColumn = this.cValidateRule;
                    break;
                }
                case 'cValidateRegex': {
                    cColumn = this.cValidateRegex;
                    break;
                }
                case 'cValidateDescription': {
                    cColumn = this.cValidateDescription;
                    break;
                }
                default:
                    break;
            }
            if (aSelectFields == '') {
                this.oValidationsDetails = await TemplateValidation.findOne({ cUsing: cColumn }).select(aSelectFields);
            } else {
                this.oValidationsDetails = await TemplateValidation.findOne({ cUsing: cColumn });
            }

        } catch (err) {
            return err;
        }
    }



    /**
     * Get Template Validations Regex according to validation rule
     * @param iTemplateID any
     */
    public async FunDCT_GetRegexForTemplate(iTemplateID: ObjectId) {
        try {
            // this.oValidationsDetails = await TemplateValidation.findOne({ cUsing: cColumn }).select(aSelectFields);

            // this.oValidationsDetails = 'test';

            // this.oValidationsDetails = await TemplateValidation.aggregate([
            //     {
            //         $lookup: {
            //             from: "gen_statuses",
            //             localField: "iStatusID",
            //             foreignField: "_id",
            //             as: "oValidationRuleListing"
            //         }
            //     },
            //     { $unwind: "$oValidationRuleListing" },

            //     {
            //         $lookup: {
            //             from: "tmpl_metadatas",
            //             localField: "aTemplateHeader.cValidations",
            //             foreignField: "cValidateRule",
            //             as: "oTemplateValidations"
            //         }
            //     },
            //     { $unwind: "$oTemplateValidations" },

            //     {
            //         $match: {
            //             'tmpl_metadatas.iTemplateID': iTemplateID
            //         }
            //     }
            // ], function (err, documents) {
            //     if (err) { return false; }
            //     return documents;
            // });


            // Working
            // let cSearchFilterQuery = { $match: { $or: [{ "cModuleCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cMessageCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            // let cSearchFilterQuery = {
            //     $match: {
            //         $and: [
            //             { "tmpl_metadatas.iTemplateID": { $in: [iTemplateID] } }
            //         ]
            //     }
            // };


            //Working-1
            // this.oValidationsDetails = await TemplateValidation.aggregate([
            //     // cSearchFilterQuery,
            //     {
            //         "$lookup": {
            //             from: "tmpl_metadatas",
            //             localField: "aTemplateHeader.cValidations",
            //             foreignField: "cValidateRule",
            //             as: "rewards"
            //         }
            //     },
            //     // {
            //     //     $match: {
            //     //         'tmpl_metadatas.iTemplateID': iTemplateID
            //     //     }
            //     // },

            //     // {
            //     //     $match: {
            //     //         $and: [
            //     //             { iTemplateID: { $in: [iTemplateID] } }
            //     //         ]
            //     //     }
            //     // },

            //     // {
            //     //     $match: {"rewards.iTemplateID": iTemplateID}
            //     // },
            //     {
            //         "$project": {
            //             iTemplateID: 1,
            //             cValidations: 1,
            //             cValidateRule: 1,
            //             points: { $arrayElemAt: ["$aTemplateHeader.cValidations", 0] }
            //         }
            //     }
            // ]);

            // var userId = mongoose.Schema.Types.ObjectId(id);
            // TemplateValidation

            this.oValidationsDetails = await TemplateValidation.aggregate([
                // { "$match": { "iTemplateID": iTemplateID } },
                //, "status": { "$eq": true }
                
                {
                    "$lookup": {
                        "from": "tmpl_metadatas",
                        "let": { "cValidateRule": "$cValidateRule"},//, "iTemplateID": iTemplateID //, "$iTemplateID": "$iTemplateID"
                        // "let": { "$iTemplateID": "$iTemplateID"},//, "iTemplateID": iTemplateID //, "$iTemplateID": "$iTemplateID"
                        "pipeline": [
                            { "$match": { iTemplateID: iTemplateID } },
                            { "$unwind": "$aTemplateHeader" },
                            {
                                "$match": {
                                    // "iTemplateID": iTemplateID,
                                    "$expr":
                                    {
                                        $and: [
                                            { "$eq": ["$aTemplateHeader.cValidations", "$$cValidateRule"] },
                                            // { "$eq": ["$iTemplateID", "$$iTemplateID"] },
                                        ]
                                    }

                                }
                            }
                        ],
                        "as": "aTemplateHeader"
                    }
                },
                // { "$match": { "iTemplateID": iTemplateID }},
            ])






            // this.oValidationsDetails = await TemplateValidation.aggregate([
            //     {
            //         "$lookup": {
            //             from: "tmpl_metadatas",
            //             localField: "aTemplateHeader.cValidations",
            //             foreignField: "cValidateRule",
            //             as: "rewards"
            //         }
            //     },
            //     { $unwind : "$rewards"},
            //     // { $match : {"aTemplateHeader.cValidations" : "value2"}},
            //     { $project : { cValidations : 0, rewards : 1}}
            // ])


            // this.oValidationsDetails = await TemplateValidation.aggregate([
            //     { $lookup : {
            //         from: "tmpl_metadatas",
            //         localField: "aTemplateHeader.cValidations",
            //         foreignField: "cValidateRule",
            //         as: "field"
            //         } },
            //         { $unwind : "$aTemplateHeader" },
            //         { $unwind : "$field" },
            //         { $project : { 
            //           "aTemplateHeader": 1, 
            //           "field" : 1, 
            //          } }

            //     // {$unwind:"$aTemplateHeader"},
            //     // {$unwind:"$aTemplateHeader.cValidations"},
            //     // {$lookup: {
            //     //     from: 'tmpl_metadatas', 
            //     //     localField: 'aTemplateHeader.cValidations', 
            //     //     foreignField: 'cValidateRule', 
            //     //     as: 'schoolInfo'}},
            //     // {$unwind:"$schoolInfo"},


            //     ])




            // this.oValidationsDetails = await TemplateValidation.aggregate([
            //     // {$match: {_id: 'john'}},
            //     {$unwind:"$aTemplateHeader"},
            //     {$unwind:"$aTemplateHeader.cValidations"},
            //     {$lookup: {
            //         from: 'tmpl_metadatas', 
            //         localField: 'aTemplateHeader.cValidations', 
            //         foreignField: 'cValidateRule', 
            //         as: 'schoolInfo'}},
            //     {$unwind:"$schoolInfo"},
            //     // {$group:{
            //     //     _id: {
            //     //         _id: '$_id',
            //     //         name: '$items.name',
            //     //     },
            //     //     aTemplateHeader: {
            //     //         $push: {
            //     //             'grad': '$items.items.grad',
            //     //             'school': '$schoolInfo._id',
            //     //             'schoolInfo': '$schoolInfo'
            //     //         }
            //     //     }
            //     // }}                    
            // ]);






        } catch (err) {
            return err;
        }
    }



}
export default new ClsDCT_ValidationRule();
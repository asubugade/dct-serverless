import { ClsDCT_Common } from "../../commonModule/Class.common";
import Template from "../../models/GenTemplate";
import moment from "moment";
import TmplConsolidationReq from "../../models/TmplConsolidationReq";
import AdditionalFields from "../../models/Additionalfields";
import MemTmplUploadLog from "../../models/MemTmplUploadLog";

const _oCommonCls = new ClsDCT_Common();
var mongoose = require('mongoose')


export const getTemplateCount = async (cSearchFilterQuery: any, cDateQuery: any, templateTypeArray: any) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $match: {
                    cTemplateType: { $in: templateTypeArray }
                }
            },
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oTemplateListing"
                }
            },
            { $unwind: "$oTemplateListing" },
            {
                $lookup: {
                    from: "tmpl_metadatas",
                    localField: "_id",
                    foreignField: "iTemplateID",
                    as: "oTemplateMetaDataListing"
                },
            },
            { $unwind: "$oTemplateMetaDataListing" },
            ...cDateQuery,
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await Template.aggregate(countAggregatePipeline);
        if (countResult.length > 0) {
            return countResult[0].count;
        } else {
            return 0; // No matching records found
        }
    }
    catch (err) {
        _oCommonCls.log(err)
    }
}

export const getTemplate = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, cDateQuery: any, cUserType: any, templateTypeArray: any, companyname: any) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }

    const oDocuments = await Template.aggregate([
        cSearchFilterQuery,
        {
            $match: {
                cTemplateType: { $in: templateTypeArray }
            }
        },
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oTemplateListing"
            },
        },
        { $unwind: "$oTemplateListing" },
        {
            $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing"
            },
        },
        { $unwind: "$oTemplateMetaDataListing" },
        {
            $lookup: {
                from: "gen_template_types",
                localField: "cTemplateType",
                foreignField: "cTemplateType",
                as: "oTemplateTypeDataListing"
            },
        },
        { $unwind: "$oTemplateTypeDataListing" },
        {
            $project: {
                _id: 1,
                cTemplateName: 1,
                cTemplateType: 1,
                iTempActiveStatus: 1,
                cTemplateSampleFile: 1,
                date: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                iUpdatedby: 1,
                oTemplateListing: 1,
                tUpdated: 1,
                iTemplateCounter: 1,
                'oTemplateMetaDataListing._id': 1,
                'oTemplateMetaDataListing.aAdditionalConfiguration': 1,
                // 'oTemplateMetaDataListing.aConsolidationData': 1,
                // 'oTemplateMetaDataListing.aDistributedData': 1,
                aDistributedDataExists: {
                    $cond: {
                        if: { $eq: [{ $type: "$oTemplateMetaDataListing.aDistributedData" }, "missing"] },
                        then: false,
                        else: true
                    }
                },
                // 'oTemplateMetaDataListing.aMappedColumns': 1,
                'oTemplateMetaDataListing.aMappedScacColumnsStat': 1,
                'oTemplateMetaDataListing.aMemberCutoffs': 1,
                'oTemplateMetaDataListing.aTemplateHeader': 1,
                'oTemplateMetaDataListing.aUnMappedColumns': 1,
                'oTemplateMetaDataListing.cAdditionalEmail': 1,
                'oTemplateMetaDataListing.cConsolidation': 1,
                'oTemplateMetaDataListing.cAddtionalFile': 1,
                'oTemplateMetaDataListing.cDistributionStatus': 1,
                'oTemplateMetaDataListing.iRedistributedIsUploaded': 1,
                'oTemplateMetaDataListing.cEmailFrom': 1,
                'oTemplateMetaDataListing.cEmailSubject': 1,
                'oTemplateMetaDataListing.cEmailTemplateID': 1,
                'oTemplateMetaDataListing.cEmailText': 1,
                'oTemplateMetaDataListing.cGenerated': 1,
                'oTemplateMetaDataListing.cHeaderType': 1,
                'oTemplateMetaDataListing.iEnteredby': 1,
                'oTemplateMetaDataListing.iMaxDepthHeaders': 1,
                'oTemplateMetaDataListing.startHeaderRowIndex': 1,
                'oTemplateMetaDataListing.iTemplateID': 1,
                'oTemplateMetaDataListing.tCuttoffdate': 1,
                'oTemplateMetaDataListing.tEntered': 1,
                'oTemplateTypeDataListing.preFillData': 1,
                'oTemplateTypeDataListing.cTemplateType': 1
            }
        },
        // ...selectedMember,
        ...cDateQuery, //added by stewari for expired date template name should not be shown
        //{ $match: {"oMessageListing.cStatusCode": 'ACTIVE'} },
        //{ $group: { _id: null, count: { $sum: -1 } } },
        //{$sort: cSortQuery},

        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic }, //aRequestDetails.iLimit
    ]);

    const now = moment(); // Get current time once
    if (aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST') {
        let cCompanyname: string = companyname;
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let cutoffDate;
                let totalSeconds = null;
                if (doc.oTemplateMetaDataListing.aMemberCutoffs[cCompanyname][0].tCuttoffdate) {
                    cutoffDate = moment(doc.oTemplateMetaDataListing.aMemberCutoffs[cCompanyname][0].tCuttoffdate);
                    totalSeconds = cutoffDate.diff(moment(), 'seconds');
                }

                return {
                    ...doc,
                    cutoffCoutdownTimer: totalSeconds,
                    formattedCountdown: formatCountdown(totalSeconds),
                };
            })
        );

        return enrichedDocuments;
    }
    else if (aRequestDetails.cProcessCode == 'LIST_TEMPLATE' && cUserType != 'Member') {
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let cutoffDate;
                let totalSeconds = null;
                let aConsolidationDataList;
                try {
                    aConsolidationDataList = await getConsolidationData(doc);
                } catch (error) {
                    console.error("An error occurred:", error);
                }
                if (doc.oTemplateMetaDataListing.tCuttoffdate) {
                    cutoffDate = moment(doc.oTemplateMetaDataListing.tCuttoffdate);
                    totalSeconds = cutoffDate.diff(moment(), 'seconds');
                }

                return {
                    ...doc,
                    cutoffCoutdownTimer: totalSeconds,
                    aConsolidationDataList: aConsolidationDataList,
                };
            })
        );

        return enrichedDocuments;
    }
    else
    // if ((aRequestDetails.cProcessCode == 'LIST_TEMPLATE' && cUserType === 'Member') || aRequestDetails.cProcessCode == 'MEMBER_UPLOAD')
    {
        return oDocuments;
    }
}

const formatCountdown = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 1) {
        return `${String(days).padStart(2, '0')} DAY ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else if (days === 1) {
        return `01 DAY ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}


const getConsolidationData = async (doc) => {
    try {
        let aConsolidationDataListing = await TmplConsolidationReq.findOne({
            iTemplateID: doc._id,
            cRequestType: 'ALL', // Filter for `cRequestType` equal to 'ALL'
            bProcesslock: 'N',
            bProcessed: 'Y'
        })
            .sort({ tEntered: -1 }) // Sort by the `tEntered` field in descending order
            .exec();
        if (aConsolidationDataListing) {
            return aConsolidationDataListing;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching consolidation data:", error);
        throw error;
    }
}

export const getTemplateTimer = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, cDateQuery: any, cUserType: any, templateTypeArray: any, companyname: any) => {
    let iLimitDynamic: number = (aRequestDetails.iLimit > 0) ? aRequestDetails.iLimit : (iCount > 0 ? iCount : 1);

    // Aggregate the documents without pagination first
    const oDocuments = await Template.aggregate([
        cSearchFilterQuery,
        {
            $match: {
                cTemplateType: { $in: templateTypeArray }
            }
        },
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oTemplateListing"
            },
        },
        { $unwind: "$oTemplateListing" },
        {
            $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing"
            },
        },
        { $unwind: "$oTemplateMetaDataListing" },
        ...cDateQuery,
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                cTemplateName: 1,
                cTemplateType: 1,
                iTempActiveStatus: 1,
                cTemplateSampleFile: 1,
                date: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                iUpdatedby: 1,
                oTemplateListing: 1,
                tUpdated: 1,
                iTemplateCounter: 1,
                'oTemplateMetaDataListing._id': 1,
                'oTemplateMetaDataListing.aAdditionalConfiguration': 1,
                aDistributedDataExists: {
                    $cond: {
                        if: { $eq: [{ $type: "$oTemplateMetaDataListing.aDistributedData" }, "missing"] },
                        then: false,
                        else: true
                    }
                },
                'oTemplateMetaDataListing.aMappedScacColumnsStat': 1,
                'oTemplateMetaDataListing.aMemberCutoffs': 1,
                'oTemplateMetaDataListing.aTemplateHeader': 1,
                'oTemplateMetaDataListing.aUnMappedColumns': 1,
                'oTemplateMetaDataListing.cAdditionalEmail': 1,
                'oTemplateMetaDataListing.cConsolidation': 1,
                'oTemplateMetaDataListing.cAddtionalFile': 1,
                'oTemplateMetaDataListing.cDistributionStatus': 1,
                'oTemplateMetaDataListing.iRedistributedIsUploaded': 1,
                'oTemplateMetaDataListing.cEmailFrom': 1,
                'oTemplateMetaDataListing.cEmailSubject': 1,
                'oTemplateMetaDataListing.cEmailTemplateID': 1,
                'oTemplateMetaDataListing.cEmailText': 1,
                'oTemplateMetaDataListing.cGenerated': 1,
                'oTemplateMetaDataListing.cHeaderType': 1,
                'oTemplateMetaDataListing.iEnteredby': 1,
                'oTemplateMetaDataListing.iMaxDepthHeaders': 1,
                'oTemplateMetaDataListing.startHeaderRowIndex': 1,
                'oTemplateMetaDataListing.iTemplateID': 1,
                'oTemplateMetaDataListing.tCuttoffdate': 1,
                'oTemplateMetaDataListing.tEntered': 1
            }
        },
    ]);
    const now = moment(); // Get current time once
    if (aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST' && cUserType === 'Member') {
        let cCompanyname: string = companyname;
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let aAdditionalFieldsDataList;
                try {
                    aAdditionalFieldsDataList = await getAdditionConfigData(doc);
                } catch (error) {
                    console.error("An error occurred:", error);
                }

                let cutoffDate = moment(doc.oTemplateMetaDataListing.aMemberCutoffs[cCompanyname][0].tCuttoffdate);
                let totalSeconds = cutoffDate.diff(now, 'seconds');

                return {
                    ...doc,
                    timer: totalSeconds,
                    formattedCountdown: formatCountdown(totalSeconds),
                    aAdditionalFieldsDataList: aAdditionalFieldsDataList
                };
            })
        );

        // Filter documents based on the timer logic
        const filteredDocuments = enrichedDocuments.filter(doc => {
            return (doc.timer >= 0 || doc.timer > 86400 || doc.timer > 345600);
        });

        const filteredCount = filteredDocuments.length;
        return { filteredDocuments, filteredCount };
    }
    else if (aRequestDetails.cProcessCode == 'LIST_TEMPLATE' && cUserType != 'Member') {
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let aConsolidationDataList;
                let aAdditionalFieldsDataList;
                try {
                    aConsolidationDataList = await getConsolidationData(doc);
                    aAdditionalFieldsDataList = await getAdditionConfigData(doc);
                } catch (error) {
                    console.error("An error occurred:", error);
                }

                const cutoffDate = moment(doc.oTemplateMetaDataListing.tCuttoffdate);
                const totalSeconds = cutoffDate.diff(moment(), 'seconds');

                return {
                    ...doc,
                    timer: totalSeconds,
                    formattedCountdown: formatCountdown(totalSeconds),
                    aConsolidationDataList: aConsolidationDataList,
                    aAdditionalFieldsDataList: aAdditionalFieldsDataList
                };
            })
        );

        // Filter documents based on the timer logic
        const filteredDocuments = enrichedDocuments.filter(doc => {
            return (doc.timer >= 0 || doc.timer > 86400 || doc.timer > 345600);
        });

        const filteredCount = filteredDocuments.length;
        return { filteredDocuments, filteredCount };
    }
}


const getAdditionConfigData = async (doc) => {
    try {
        let aAdditionalFieldsDataListing = await AdditionalFields.findOne({
            _id: doc.oTemplateMetaDataListing.aAdditionalConfiguration[0].cAdditionalFields,
        })
        if (aAdditionalFieldsDataListing) {
            return aAdditionalFieldsDataListing;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching consolidation data:", error);
        throw error;
    }
}

export const getTemplateNoTimer = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, cDateQuery: any, cUserType: any, templateTypeArray: any, companyname: any) => {
    let iLimitDynamic: number = (aRequestDetails.iLimit > 0) ? aRequestDetails.iLimit : (iCount > 0 ? iCount : 1);

    const oDocuments = await Template.aggregate([
        cSearchFilterQuery,
        {
            $match: {
                cTemplateType: { $in: templateTypeArray }
            }
        },
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oTemplateListing"
            },
        },
        { $unwind: "$oTemplateListing" },
        {
            $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing"
            },
        },
        { $unwind: "$oTemplateMetaDataListing" },
        ...cDateQuery,
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                cTemplateName: 1,
                cTemplateType: 1,
                iTempActiveStatus: 1,
                cTemplateSampleFile: 1,
                date: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                iUpdatedby: 1,
                oTemplateListing: 1,
                tUpdated: 1,
                iTemplateCounter: 1,
                'oTemplateMetaDataListing._id': 1,
                'oTemplateMetaDataListing.aAdditionalConfiguration': 1,
                aDistributedDataExists: {
                    $cond: {
                        if: { $eq: [{ $type: "$oTemplateMetaDataListing.aDistributedData" }, "missing"] },
                        then: false,
                        else: true
                    }
                },
                'oTemplateMetaDataListing.aMappedScacColumnsStat': 1,
                'oTemplateMetaDataListing.aMemberCutoffs': 1,
                'oTemplateMetaDataListing.aTemplateHeader': 1,
                'oTemplateMetaDataListing.aUnMappedColumns': 1,
                'oTemplateMetaDataListing.cAdditionalEmail': 1,
                'oTemplateMetaDataListing.cConsolidation': 1,
                'oTemplateMetaDataListing.cAddtionalFile': 1,
                'oTemplateMetaDataListing.cDistributionStatus': 1,
                'oTemplateMetaDataListing.iRedistributedIsUploaded': 1,
                'oTemplateMetaDataListing.cEmailFrom': 1,
                'oTemplateMetaDataListing.cEmailSubject': 1,
                'oTemplateMetaDataListing.cEmailTemplateID': 1,
                'oTemplateMetaDataListing.cEmailText': 1,
                'oTemplateMetaDataListing.cGenerated': 1,
                'oTemplateMetaDataListing.cHeaderType': 1,
                'oTemplateMetaDataListing.iEnteredby': 1,
                'oTemplateMetaDataListing.iMaxDepthHeaders': 1,
                'oTemplateMetaDataListing.startHeaderRowIndex': 1,
                'oTemplateMetaDataListing.iTemplateID': 1,
                'oTemplateMetaDataListing.tCuttoffdate': 1,
                'oTemplateMetaDataListing.tEntered': 1
            }
        }
    ]);
    const now = moment(); // Get current time once
    if (aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST' && cUserType === 'Member') {
        let cCompanyname: string = companyname;
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let aAdditionalFieldsDataList;
                try {
                    aAdditionalFieldsDataList = await getAdditionConfigData(doc);
                } catch (error) {
                    console.error("An error occurred:", error);
                }

                let cutoffDate = moment(doc.oTemplateMetaDataListing.aMemberCutoffs[cCompanyname][0].tCuttoffdate);
                let totalSeconds = cutoffDate.diff(now, 'seconds');

                return {
                    ...doc,
                    timer: totalSeconds,
                    formattedCountdown: formatCountdown(totalSeconds),
                    aAdditionalFieldsDataList: aAdditionalFieldsDataList
                };
            })
        );

        // Filter documents based on timer logic before pagination
        let filteredDocuments = enrichedDocuments.filter(doc => doc.timer <= 0); // Only include documents with a timer less than 0
        const filteredCount = filteredDocuments.length;
        return { filteredDocuments, filteredCount };
    }
    else if (aRequestDetails.cProcessCode == 'LIST_TEMPLATE' && cUserType != 'Member') {

        // Enrich documents and calculate timer here
        const enrichedDocuments = await Promise.all(
            oDocuments.map(async doc => {
                let aConsolidationDataList;
                let aAdditionalFieldsDataList;
                try {
                    aConsolidationDataList = await getConsolidationData(doc);
                    aAdditionalFieldsDataList = await getAdditionConfigData(doc);
                } catch (error) {
                    console.error("An error occurred:", error);
                }

                const cutoffDate = moment(doc.oTemplateMetaDataListing.tCuttoffdate);
                const totalSeconds = cutoffDate.diff(moment(), 'seconds');

                return {
                    ...doc,
                    timer: totalSeconds,
                    formattedCountdown: formatCountdown(totalSeconds),
                    aConsolidationDataList: aConsolidationDataList,
                    aAdditionalFieldsDataList: aAdditionalFieldsDataList
                };
            })
        );

        // Filter documents based on timer logic before pagination
        let filteredDocuments = enrichedDocuments.filter(doc => doc.timer <= 0); // Only include documents with a timer less than 0
        const filteredCount = filteredDocuments.length;
        return { filteredDocuments, filteredCount };

    }


}

export const getMemberUploadLogCount = async (cSearchFilterQuery) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $match: {
                    iActiveStatus: 0
                }
            },
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oMemberUploadLogListing"
                }
            },
            { $unwind: "$oMemberUploadLogListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await MemTmplUploadLog.aggregate(countAggregatePipeline);
        if (countResult.length > 0) {
            return countResult[0].count;
        } else {
            return 0; // No matching records found
        }
    }
    catch (err) {
        _oCommonCls.log(err)
    }
}

export const getMemberUploadLog = async (aRequestDetails, oSort, cSearchFilterQuery, iCount, iTemplateID) => {

    let iLimitDynamic: number;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const recordFound = await MemTmplUploadLog.find({ iTemplateID: { $in: [new mongoose.Types.ObjectId(iTemplateID)] }, iActiveStatus: 0 });

    if (recordFound.length) {
        try {
            const oDocuments = await MemTmplUploadLog.aggregate([
                cSearchFilterQuery,
                {
                    $match: {
                        iActiveStatus: 0
                    }
                },
                // { $match: { iTemplateID: new mongoose.Types.ObjectId(iTemplateID) } },
                {
                    $lookup: {
                        from: "gen_members",
                        localField: "iMemberID",
                        foreignField: "_id",
                        as: "oMemberDetailListing"
                    }
                },
                // { $unwind: "$oMemberDetailListing" },

                /* In below block of code $unwind is modified by adding "path" and "preserveNullAndEmptyArrays": true ,so that if "iMemberID" 
                is not found in collection then preiviously aggregated collection can be returned  */
                {
                    "$unwind": {
                        "path": "$oMemberDetailListing",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  
                {
                    $lookup: {
                        from: "gen_users",
                        localField: "iEnteredby",
                        foreignField: "_id",
                        as: "oUserDetailListing"
                    }
                },
                /* In below block of code $unwind is modified by adding "path" and "preserveNullAndEmptyArrays": true ,so that if "iEnteredby" 
                 is not found in collection then preiviously aggregated collection can be returned  */
                {
                    "$unwind": {
                        "path": "$oUserDetailListing",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  
                { $sort: oSort },
                { $skip: aRequestDetails.iOffsetLimit },
                { $limit: iLimitDynamic },
            ]);
            return oDocuments;
        } catch (err) { return false }

    } else {
        return false;
    }
}


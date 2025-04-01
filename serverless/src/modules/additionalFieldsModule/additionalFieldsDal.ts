import { ClsDCT_Common } from "../../commonModule/Class.common";
import AdditionalFields from "../../models/Additionalfields";


const _oCommonCls = new ClsDCT_Common();
export const getAdditionalFieldsCount = async(cSearchFilterQuery: any) => {
    try {
      const countAggregatePipeline = [
        cSearchFilterQuery,
        {
          $lookup: {
            from: "gen_statuses",
            localField: "iStatusID",
            foreignField: "_id",
            as: "oAdditionalFieldListing"
          }
        },
        { $unwind: "$oAdditionalFieldListing" },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ];
      const countResult = await AdditionalFields.aggregate(countAggregatePipeline);
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


  export const getAdditionalFields = async(aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number)=> {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
      iLimitDynamic = iCount;
    } else {
      iLimitDynamic = aRequestDetails.iLimit;
    }
    const oDocuments = await AdditionalFields.aggregate([
      cSearchFilterQuery,
      {
        $lookup: {
          from: "gen_statuses",
          localField: "iStatusID",
          foreignField: "_id",
          as: "oAdditionalFieldListing"
        }
      },
      { $unwind: "$oAdditionalFieldListing" },
      //code added by spirgonde for changing entered by from Id to user name start ...
      {
        $lookup: {
          from: "gen_users",
          localField: "iEnteredby",
          foreignField: "_id",
          as: "oUserListing"
        }
      },
      { $unwind: "$oUserListing" },
      {
        $lookup: {
          from: "gen_users",
          localField: "iUpdatedby",
          foreignField: "_id",
          as: "oUpdatedby"
        }
      },
      /* In below block of code $unwind is modified by adding "path" and "preserveNullAndEmptyArrays": true ,so that if "iUpdatedby" 
       is not found in collection then preiviously aggregated collection can be returned  */
      {
        "$unwind": {
          "path": "$oUpdatedby",
          "preserveNullAndEmptyArrays": true
        }
      },
      //code added by spirgonde for changing entered by from Id to user name end .  
      { $sort: oSort },
      { $skip: aRequestDetails.iOffsetLimit },
      { $limit: iLimitDynamic },//aRequestDetails.iLimit
      {
        $project: {
          _id: 1,
          cSelectionType: 1,
          cAdditionalFieldText: 1,
          cAdditionalFieldValue: 1,
          iStatusID: 1,
          iEnteredby: 1,
          tEntered: 1,
          iUpdatedby: 1,
          tUpdated: 1,
          oAdditionalFieldListing: 1,
      
          "oUserListing._id": 1,
          "oUserListing.cName": 1,
          "oUserListing.cUsername": 1,
      
          "oUpdatedby._id": 1,
          "oUpdatedby.cName": 1,
          "oUpdatedby.cUsername": 1,
        }
      }
    ]
    );//Call backed removed
   
    return oDocuments;
  }
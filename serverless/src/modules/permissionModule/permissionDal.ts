import { ClsDCT_Common } from "../../commonModule/Class.common";
import Permission from "../../models/GenPermission";




const _oCommonCls = new ClsDCT_Common();

export const getPermissionCount = async (cSearchFilterQuery) => {
  try {
    const countAggregatePipeline = [

      {
        $lookup: {
          from: "gen_statuses",
          localField: "iStatusID",
          foreignField: "_id",
          as: "oPermissionListing"
        }
      },
      { $unwind: "$oPermissionListing" },
      {
        $lookup: {
          from: "gen_accesstypes",
          localField: "iAccessTypeID",
          foreignField: "_id",
          as: "oAccessTypeListing"
        }
      },
      { $unwind: "$oAccessTypeListing" },
      { $unwind: "$oAccessTypeListing.cAccessCode" },
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

      cSearchFilterQuery,

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
      {
        "$unwind": {
          "path": "$oUpdatedby",
          "preserveNullAndEmptyArrays": true
        }
      }
    ];
    const countResult = await Permission.aggregate(countAggregatePipeline);
    if (countResult.length > 0) {
      return countResult.length;
    } else {
      return 0; // No matching records found
    }
  }
  catch (err) {
    _oCommonCls.log(err)
  }
}


export const getPermission = async (aRequestDetails, oSort, cSearchFilterQuery, iCount) => {
  let iLimitDynamic: number;
  if (aRequestDetails.iLimit <= 0 && iCount > 0) {
    iLimitDynamic = iCount;
  } else {
    iLimitDynamic = aRequestDetails.iLimit;
  }
  if (oSort.iProcessID) {
    oSort = { "oProcessListing.cProcessCode": oSort.iProcessID }
  }
  if (oSort.iAccessTypeID) {
    oSort = { "oAccessTypeListing.cAccessCode": oSort.iAccessTypeID }
  }

  const oDocuments = await Permission.aggregate([
    {
      $lookup: {
        from: "gen_statuses",
        localField: "iStatusID",
        foreignField: "_id",
        as: "oPermissionListing"
      }
    },
    { $unwind: "$oPermissionListing" },
    {
      $lookup: {
        from: "gen_accesstypes",
        localField: "iAccessTypeID",
        foreignField: "_id",
        as: "oAccessTypeListing"
      }
    },
    { $unwind: "$oAccessTypeListing" },
    { $unwind: "$oAccessTypeListing.cAccessCode" },  //added by spirgonde for searchFilter issue
    {
      $lookup: {
        from: "gen_processes",
        localField: "iProcessID",
        foreignField: "_id",
        as: "oProcessListing"
      }
    },
    { $unwind: "$oProcessListing" },
    { $unwind: "$oProcessListing.cProcessCode" }, //added by spirgonde for searchFilter issue

    cSearchFilterQuery, //added by spirgonde for searchFilter issue

    //code added by spirgonde for changing entered by  and Updated By from Id to user name start ...
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
    //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  
    { $sort: oSort },
    { $skip: aRequestDetails.iOffsetLimit },
    { $limit: iLimitDynamic },
    {
      $project: {
        _id: 1,
        iAccessTypeID: 1,
        iProcessID: 1,
        cAdd: 1,
        cEdit: 1,
        cView: 1,
        cDelete: 1,
        iStatusID: 1,
        iEnteredby: 1,
        tEntered: 1,
        iUpdatedby: 1,
        tUpdated: 1,
        oPermissionListing: 1,
        oAccessTypeListing: 1,
        oProcessListing: 1,

        "oUserListing._id": 1,
        "oUserListing.cName": 1,
        "oUserListing.cUsername": 1,

        "oUpdatedby._id": 1,
        "oUpdatedby.cName": 1,
        "oUpdatedby.cUsername": 1,
      },
    }
  ]);


  return oDocuments;
}
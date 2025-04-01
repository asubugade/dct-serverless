import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import Template, { ITemplate } from "../../models/GenTemplate";
import { getTemplate, getTemplateCount, getTemplateNoTimer, getTemplateTimer } from "./listTemplateDal";
import moment from "moment";
import TmplUploadLog, { ITmplUploadLog } from "../../models/Tmpluploadlog"

var mongoose = require('mongoose')




export class ListTemplateService {
  private _oCommonCls = new ClsDCT_Common();

  public templateListing = async (event) => {
    try {
      const body = JSON.parse(event.body)
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode, cTemplateTypes } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode };

      let cSearchFilterQuery: any = {
        $match: {
          iTempActiveStatus: 0
        }
      };
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery.$match.$or = [{ "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }];
      }

      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN']
      await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      this._oCommonCls.FunDCT_ApiRequest(event);
      let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
      let cUserType = oCurrentUserType[0].cAccessCode;
      let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
      let bRestrictList = false;

      if (aRequestDetails.cProcessCode !== 'LIST_TEMPLATE' && aRequestDetails.cProcessCode !== 'MEMBER_TEMPLATE_LIST') {
        bRestrictList = true;
      }
      let cDateQuery: any = [];
      if (aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST') {
        cDateQuery = [
          {
            $addFields: {
              memberCutoff: {
                $cond: {
                  if: { $isArray: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` },
                  then: { $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` },
                  else: {
                    $first: {
                      $map: {
                        input: { $objectToArray: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` },
                        as: "entry",
                        in: "$$entry.v"
                      }
                    }
                  }
                }
              }
            }
          },
          {
            $match: {
              memberCutoff: { $exists: true, $ne: null }
            }
          }
        ];
      }
      if (bRestrictList) {
        if (cUserType == 'Member') {
          cDateQuery = [
            { $addFields: { newF: { $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` } } },
            { $addFields: { date: { $dateFromString: { dateString: "$newF.tCuttoffdate" } } } },
            { $match: { date: { $gte: new Date(new Date().toUTCString()) } } }
          ];
        } else {
          cDateQuery = [
            { $addFields: { date: { $dateFromString: { dateString: "$oTemplateMetaDataListing.tCuttoffdate" } } } },
            { $match: { $or: [{ date: { $gte: new Date(new Date().toUTCString()) } }, { date: { $lte: new Date(new Date().toUTCString()) } }, { date: null }] } }
          ];
        }
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      const templateTypeArray: any = [];
      const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
      if (Array.isArray(templateType)) {
        for (const objectId of templateType) {
          let oUserTemplateTypeDetails: any = await TemplateType.findOne({ _id: objectId });
          templateTypeArray.push(oUserTemplateTypeDetails['_doc'].cTemplateType);
        }
      }

      const validTemplates = await Template.find({ iTempActiveStatus: 0 });
      const validTemplateIDs = validTemplates.map(template => template._id);
      cSearchFilterQuery.$match._id = { $in: validTemplateIDs };

      // let iCount: number = await this.FunDCT_getTemplateCount(cSearchFilterQuery, cDateQuery, cTemplateTypes && cTemplateTypes.length ?cTemplateTypes : templateTypeArray);
      let iCount: number = await getTemplateCount(
        cSearchFilterQuery,
        cDateQuery,
        Array.isArray(cTemplateTypes) && cTemplateTypes.length ? cTemplateTypes : templateTypeArray
      );
      if (iCount > 0) {
        let oTemplateListing = await getTemplate(aRequestDetails, oSort, cSearchFilterQuery, iCount, cDateQuery, cUserType, cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray, cCompanyname);
        if (oTemplateListing) {
          let oTemplateListResp;
          if (templateTypeArray && templateTypeArray.length > 0) {
            oTemplateListResp = oTemplateListing.filter(template =>
              templateTypeArray.includes(template.cTemplateType)
            );
            oTemplateListing = oTemplateListResp;
          }
          oTemplateListResp = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: oTemplateListing
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListResp);
        }
      } else {
        let oTemplateListing = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListing);
      }

    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public listAllTemplateNamesListing = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode };

      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
      await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      this._oCommonCls.FunDCT_ApiRequest(event);

      const oAllTemplateNamesListing = await Template.aggregate([
        {
          $project: {
            cTemplateName: { $toLower: "$cTemplateName" }, // Convert to lowercase
          },
        },
      ]);

      if (oAllTemplateNamesListing) {
        let oTemplateListResp;
        oTemplateListResp = {
          total: oAllTemplateNamesListing.length,
          page: aRequestDetails.iOffset,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: oAllTemplateNamesListing
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListResp);
      }
      else {
        let oTemplateListing = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListing);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public templateListingTimer = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode, cTemplateTypes } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode, cTemplateTypes };

      let cSearchFilterQuery: any = {
        $match: {
          iTempActiveStatus: 0
        }
      };
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery.$match.$or = [{ "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }];
      }

      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
      await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      this._oCommonCls.FunDCT_ApiRequest(event);
      let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
      let cUserType = oCurrentUserType[0].cAccessCode;

      let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
      let bRestrictList = false;

      if (aRequestDetails.cProcessCode !== 'LIST_TEMPLATE' && aRequestDetails.cProcessCode !== 'MEMBER_TEMPLATE_LIST') {
        bRestrictList = true;
      }

      let cDateQuery: any = [];
      if (aRequestDetails.cProcessCode && cUserType) {
        if (aRequestDetails.cProcessCode == 'LIST_TEMPLATE' && (cUserType === 'Admin' || cUserType === 'CENTRIC')) {

          let oIdSort = {};
          oIdSort['_id'] = -1;

          const currentMomentString = moment().format("YYYY-MM-DD HH:mm:ss");
          const currentUTCMomentString = moment().utc().format("YYYY-MM-DD HH:mm:ss");

          this._oCommonCls.log("currentMomentString:" + currentMomentString)
          this._oCommonCls.log("currentUTCMomentString:" + currentUTCMomentString)
          const oDocuments = await Template.aggregate([
            {
              $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing",
              },
            },
            { $unwind: "$oTemplateMetaDataListing" },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        "oTemplateMetaDataListing.tCuttoffdate": { $gt: currentMomentString }, // Match records greater than current time
                      },
                      {
                        "oTemplateMetaDataListing.tCuttoffdate": { $exists: false }, // Match records where tCuttoffdate does not exist
                      },
                    ],
                  },
                  {
                    iTempActiveStatus: 0,
                  },
                ],
              },
            },
            { $sort: oIdSort },
            {
              $project: {
                _id: 1,
                cTemplateName: 1,
                tEntered: 1,
                tUpdated: 1,
                "oTemplateMetaDataListing._id": 1,
                "oTemplateMetaDataListing.aMemberCutoffs": 1,
                "oTemplateMetaDataListing.iTemplateID": 1,
                "oTemplateMetaDataListing.tCuttoffdate": 1,
              },
            },
          ]);

          const validTemplateIDs = oDocuments.map(template => template._id);
          cSearchFilterQuery.$match._id = { $in: validTemplateIDs };

          // const currentDate = new Date();
          // const sixMonthsAgo = new Date();
          // sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
          cDateQuery = [
            {
              $addFields: {
                enteredDate: "$oTemplateMetaDataListing.tEntered"
              }
            },
            {
              $match: {
                $and: [
                  {
                    enteredDate: {
                      $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                      $lte: new Date()
                    }
                  }
                ]
              }
            }
          ];
        } else if (aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST' && cUserType === 'Member') {

          let oIdSort = {};
          oIdSort['_id'] = -1;

          const currentMomentString = moment().format("YYYY-MM-DD HH:mm:ss");
          const oDocuments = await Template.aggregate([
            {
              $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing",
              },
            },
            { $unwind: "$oTemplateMetaDataListing" },
            {
              $addFields: {
                newF: {
                  $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}`,
                },
              },
            },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        "newF.tCuttoffdate": { $gt: currentMomentString },
                      },
                    ],
                  },
                  {
                    iTempActiveStatus: 0,
                  },
                ],
              },
            },
            { $sort: oIdSort },
            {
              $project: {
                _id: 1,
                cTemplateName: 1,
                tEntered: 1,
                tUpdated: 1,
                "oTemplateMetaDataListing._id": 1,
                "oTemplateMetaDataListing.aMemberCutoffs": 1,
                "oTemplateMetaDataListing.iTemplateID": 1,
                "oTemplateMetaDataListing.tCuttoffdate": 1,
              },
            },
          ]);
          const validTemplateIDs = oDocuments.map(template => template._id);
          cSearchFilterQuery.$match._id = { $in: validTemplateIDs };
        }
      }
      // Additional logic for restrict list based on user type
      if (bRestrictList) {
        if (cUserType === 'Member') {
          cDateQuery = [
            { $addFields: { newF: { $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` } } },
            { $addFields: { date: { $dateFromString: { dateString: "$newF.tCuttoffdate" } } } },
            { $match: { date: { $gte: new Date(new Date().toUTCString()) } } }
          ];
        } else {
          cDateQuery = [
            { $addFields: { date: { $dateFromString: { dateString: "$oTemplateMetaDataListing.tCuttoffdate" } } } },
            {
              $match: {
                $or: [
                  { date: { $gte: new Date(new Date().toUTCString()) } },
                  { date: { $lte: new Date(new Date().toUTCString()) } },
                  { date: null }
                ]
              }
            }
          ];
        }
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      const templateTypeArray: any = [];
      const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
      if (Array.isArray(templateType)) {
        for (const objectId of templateType) {
          let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
          templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
        }
      }

      if (!cSearchFilterQuery.$match._id) {
        const validTemplates = await Template.find({ iTempActiveStatus: 0 });
        const validTemplateIDs = validTemplates.map(template => template._id);
        cSearchFilterQuery.$match._id = { $in: validTemplateIDs };
      }

      let iCount: number = await getTemplateCount(
        cSearchFilterQuery,
        cDateQuery,
        Array.isArray(cTemplateTypes) && cTemplateTypes.length ? cTemplateTypes : templateTypeArray
      );
      const { filteredDocuments, filteredCount }: any = await getTemplateTimer(
        aRequestDetails,
        oSort,
        cSearchFilterQuery,
        iCount,
        cDateQuery,
        cUserType,
        Array.isArray(cTemplateTypes) && cTemplateTypes.length ? cTemplateTypes : templateTypeArray,
        cCompanyname
      );
      if (filteredDocuments.length > 0) {
        let oTemplateListResp = {
          total: iCount,
          page: aRequestDetails.iOffset,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: filteredDocuments
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListResp);
      } else {
        let oTemplateListing = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListing);
      }

    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public templateNotEualTimer = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode, cTemplateTypes } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cProcessCode };
      let cSearchFilterQuery: any = {
        $match: {
          iTempActiveStatus: 0
        }
      };
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery.$match.$or = [{ "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }];
      }

      const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
      await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      this._oCommonCls.FunDCT_ApiRequest(event);
      let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
      let cUserType = oCurrentUserType[0].cAccessCode;
      let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
      let bRestrictList = false;

      if (aRequestDetails.cProcessCode !== 'LIST_TEMPLATE' && aRequestDetails.cProcessCode !== 'MEMBER_TEMPLATE_LIST') {
        bRestrictList = true;
      }

      let cDateQuery: any = [];
      if (aRequestDetails.cProcessCode && cUserType) {
        if (aRequestDetails.cProcessCode === 'LIST_TEMPLATE' && (cUserType === 'Admin' || cUserType === 'CENTRIC')) {

          let oIdSort = {};
          oIdSort['_id'] = -1;

          const currentMomentString = moment().format("YYYY-MM-DD HH:mm:ss");
          const oDocuments = await Template.aggregate([
            {
              $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing",
              },
            },
            { $unwind: "$oTemplateMetaDataListing" },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        "oTemplateMetaDataListing.tCuttoffdate": { $lt: currentMomentString }, // Match records greater than current time
                      },
                    ],
                  },
                  {
                    iTempActiveStatus: 0,
                  },
                ],
              },
            },
            { $sort: oIdSort },
            {
              $project: {
                _id: 1,
                cTemplateName: 1,
                tEntered: 1,
                tUpdated: 1,
                "oTemplateMetaDataListing._id": 1,
                "oTemplateMetaDataListing.aMemberCutoffs": 1,
                "oTemplateMetaDataListing.iTemplateID": 1,
                "oTemplateMetaDataListing.tCuttoffdate": 1,
              },
            },
          ]);
          const validTemplateIDs = oDocuments.map(template => template._id);
          cSearchFilterQuery.$match._id = { $in: validTemplateIDs };
          cDateQuery = [
            {
              $addFields: {
                enteredDate: "$oTemplateMetaDataListing.tEntered"
              }
            },
            {
              $match: {
                $and: [
                  {
                    enteredDate: {
                      $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                      $lte: new Date()
                    }
                  }
                ]
              }
            }
          ];
        } else if (aRequestDetails.cProcessCode === 'MEMBER_TEMPLATE_LIST' && cUserType === 'Member') {

          let oIdSort = {};
          oIdSort['_id'] = -1;

          const currentMomentString = moment().format("YYYY-MM-DD HH:mm:ss");
          const oDocuments = await Template.aggregate([
            {
              $lookup: {
                from: "tmpl_metadatas",
                localField: "_id",
                foreignField: "iTemplateID",
                as: "oTemplateMetaDataListing",
              },
            },
            { $unwind: "$oTemplateMetaDataListing" },
            {
              $addFields: {
                newF: {
                  $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}`,
                },
              },
            },
            {
              $match: {
                $and: [
                  {
                    $or: [
                      {
                        "newF.tCuttoffdate": { $lt: currentMomentString },
                      },
                    ],
                  },
                  {
                    iTempActiveStatus: 0,
                  },
                ],
              },
            },
            { $sort: oIdSort },
            {
              $project: {
                _id: 1,
                cTemplateName: 1,
                tEntered: 1,
                tUpdated: 1,
                "oTemplateMetaDataListing._id": 1,
                "oTemplateMetaDataListing.aMemberCutoffs": 1,
                "oTemplateMetaDataListing.iTemplateID": 1,
                "oTemplateMetaDataListing.tCuttoffdate": 1,
              },
            },
          ]);
          const validTemplateIDs = oDocuments.map(template => template._id);
          cSearchFilterQuery.$match._id = { $in: validTemplateIDs };

          const currentDate = new Date();
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
          cDateQuery = [
            {
              $addFields: {
                enteredDate: "$oTemplateMetaDataListing.tEntered"
              }
            },
            // Match conditions
            {
              $match: {
                $and: [
                  {
                    enteredDate: {
                      $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                      $lte: new Date()
                    }
                  }
                ]
              }
            }
          ];
        }
        if (bRestrictList) {
          if (cUserType == 'Member') {
            cDateQuery = [
              { $addFields: { newF: { $first: `$oTemplateMetaDataListing.aMemberCutoffs.${cCompanyname}` } } },
              { $addFields: { date: { $dateFromString: { dateString: "$newF.tCuttoffdate" } } } },
              { $match: { date: { $gte: new Date(new Date().toUTCString()) } } }
            ];
          } else {
            cDateQuery = [
              { $addFields: { date: { $dateFromString: { dateString: "$oTemplateMetaDataListing.tCuttoffdate" } } } },
              { $match: { $or: [{ date: { $gte: new Date(new Date().toUTCString()) } }, { date: { $lte: new Date(new Date().toUTCString()) } }, { date: null }] } }
            ];
          }
        }

        let oSort = {};
        if (aRequestDetails.cSort) {
          oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
        } else {
          oSort['_id'] = -1;
        }

        const templateTypeArray: any = [];
        const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
        if (Array.isArray(templateType)) {
          for (const objectId of templateType) {
            let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
            templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
          }
        }

        if (!cSearchFilterQuery.$match._id) {
          const validTemplates = await Template.find({ iTempActiveStatus: 0 });
          const validTemplateIDs = validTemplates.map(template => template._id);
          cSearchFilterQuery.$match._id = { $in: validTemplateIDs };
        }

        let iCount: number = await getTemplateCount(
          cSearchFilterQuery,
          cDateQuery,
          Array.isArray(cTemplateTypes) && cTemplateTypes.length ? cTemplateTypes : templateTypeArray
        );
        if (iCount > 0) {
          const { filteredDocuments, filteredCount }: any = await getTemplateNoTimer(
            aRequestDetails,
            oSort,
            cSearchFilterQuery,
            iCount,
            cDateQuery,
            cUserType,
            cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray,
            cCompanyname
          );
          if (filteredDocuments.length > 0) {
            let oTemplateListResp = {
              total: iCount,
              page: aRequestDetails.iOffset,
              pageSize: aRequestDetails.iLimit,
              aModuleDetails: filteredDocuments
            };
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListResp);
          }
        }
        else {
          let oTemplateListing = {
            total: 0,
            page: 0,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: []
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oTemplateListing);
        }
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public downloadSampleTemplate = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { iTemplateID, cProcessCode } = body;
    const aRequestDetails = { iTemplateID, cProcessCode };
    const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];

    this._oCommonCls.FunDCT_ApiRequest(event);
    await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);

    let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
    let cUserType = oCurrentUserType[0].cAccessCode;
    let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;

    let downloadPath;
    if (cUserType == 'Member' || aRequestDetails.cProcessCode == 'MEMBER_TEMPLATE_LIST') {
      const oUploadlogs = await TmplUploadLog.findOne({
        iTemplateID: { $in: [new mongoose.Types.ObjectId(iTemplateID)] },
        iActiveStatus: 0,
      }).sort({ _id: -1 });

      if (oUploadlogs) {
        for (let obj in oUploadlogs.cDistributionDetails) {
          if (oUploadlogs.cDistributionDetails[obj].cDistScaccode == cCompanyname) {
            downloadPath = oUploadlogs.cDistributionDetails[obj].cMemberDistributionFilePath;
            break;
          }
        }
      }
    }

    let oTemplate = (await Template.findOne({ _id: iTemplateID }).lean()) as ITemplate;
    if (!downloadPath && oTemplate) {
      downloadPath = oTemplate.cTemplateSampleFile;
    }

    const oFileStream: any = await this._oCommonCls.FunDCT_DownloadS3File(downloadPath);

    if (oFileStream) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${iTemplateID}.xlsx"`,
        },
        body: oFileStream,
        isBase64Encoded: true,
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'File not found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};


public getTemplateWithMetadata = async(event) => {
  try {

    const { iTemplateID } = JSON.parse(event.body);
    const oDocuments = await Template.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
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
        $project: {
          _id: 1,
          cTemplateName: 1,
          cTemplateType: 1,
          cTemplateSampleFile: 1,
          iTempActiveStatus: 1,
          date: 1,
          iStatusID: 1,
          iEnteredby: 1,
          tEntered: 1,
          iUpdatedby: 1,
          oTemplateListing: 1,
          tUpdated: 1,
          'oTemplateMetaDataListing._id': 1,
          'oTemplateMetaDataListing.aAdditionalConfiguration': 1,
          // 'oTemplateMetaDataListing.aConsolidationData': 1,
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
          'oTemplateMetaDataListing.tEntered': 1
        }
      }, 
    ]);//Call back removed

    if (oDocuments) {
      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LIST_TEMPLATE', 'TEMPLATE_LISTED', 200, oDocuments);
    }
  } catch (err) {
    return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
  }
}


}
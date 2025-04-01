import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getStatus, getStatusCount } from "./statusDal";
import GenStatus, { IStatus } from "../../models/GenStatus";

export class StatusService {
  private _oCommonCls = new ClsDCT_Common();


  public statusListing = async (event) => {
    try {
      const body = JSON.parse(event.body);

      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

      let cSearchFilterQuery: any;
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery = { $match: { $or: [{ "cStatusCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cStatusName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
      } else {
        cSearchFilterQuery = { $match: {} };
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      let iCount: number = await getStatusCount(cSearchFilterQuery);
      if (iCount > 0) {
        let oStatus: any = await getStatus(aRequestDetails, oSort, cSearchFilterQuery, iCount);
        if (oStatus) {
          let oStatusRes = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: oStatus,
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_LISTED', 200, oStatusRes);
        }
      } else {
        let oStatusRes = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_LISTED', 200, oStatusRes);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public statusAdd = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cStatusCode, cStatusName, cStatusDesc } = body;
      const aRequestDetails = { cStatusCode, cStatusName, cStatusDesc, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

      let oStatus = await GenStatus.findOne({ cStatusCode: cStatusCode, cStatusName: cStatusName }).lean() as IStatus;
      if (oStatus) {
        // Update
        oStatus = await GenStatus.findOneAndUpdate(
          { cStatusCode: cStatusCode },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as IStatus;;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_UPDATED', 200, oStatus);
      } else {
        // Create
        oStatus = new GenStatus(aRequestDetails);
        await oStatus.save();
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_INSERTED', 200, oStatus);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public statusUpdate = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cStatusCode, cStatusName, cStatusDesc } = body;
      const aMessageFields = {
        cStatusCode,
        cStatusName,
        cStatusDesc,
        //iStatusID: iStatusID,
        iUpdatedby: event.requestContext.authorizer._id,
        tUpdated: new Date()
      };

      let oStatus = await GenStatus.findOne({ _id: event.pathParameters.id }).lean() as IStatus;

      if (oStatus) {
        oStatus = await GenStatus.findOneAndUpdate(
          { _id: event.pathParameters.id },
          { $set: aMessageFields },
          { new: true }
        ).lean() as IStatus;;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_UPDATED', 200, oStatus);

      } else {
        return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public statusDelete = async (event) => {
    let oStatus = await GenStatus.findOne({ _id: event.pathParameters.id }).lean() as IStatus;
    if (oStatus) {
      await GenStatus.deleteOne({ _id: event.pathParameters.id }).then(result => {
        return true;
      });
      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'STATUS', 'STATUS_DELETED', 200, event.pathParameters.id);
    } else {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }
}
import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getProcess, getProcessCount } from "./processDal";
import GenProcess, { IProcess } from "../../models/GenProcess"

export class ProcessService {
  private _oCommonCls = new ClsDCT_Common();

  public processListing = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, aCode } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

      let cSearchFilterQuery: any;
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery = { $match: { $or: [{ "cProcessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cProcessName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
      } else {
        cSearchFilterQuery = { $match: {} };
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }
      let cStatusFilter;
      if (aCode && aCode == 'Email') {
        cStatusFilter = {
          $match: {
            "oProcessListing": {
              $elemMatch: { cStatusCode: "ACTIVE" }
            }
          }
        }
      }
      else {
        cStatusFilter = {
          $match: {
          }
        }
      }

      let iCount: number = await getProcessCount(cSearchFilterQuery, cStatusFilter);
      if (iCount > 0) {
        let oProcess: any = await getProcess(aRequestDetails, oSort, cSearchFilterQuery, iCount, cStatusFilter);
        if (oProcess) {
          let oProcessRes = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: oProcess
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_LISTED', 200, oProcessRes);
        }
      } else {
        let oProcessRes = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_LISTED', 200, oProcessRes);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public processAdd = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cProcessCode, cProcessName, cProcessDesc, iStatusID } = body;
      const aRequestDetails = { cProcessCode, cProcessName, cProcessDesc, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

      let oProcess = await GenProcess.findOne({ cProcessCode: cProcessCode, cProcessName: cProcessName }).lean() as IProcess;
      if (oProcess) {
        // Update
        oProcess = await GenProcess.findOneAndUpdate(
          { cAccessCode: cProcessCode },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as IProcess;;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_UPDATED', 200, oProcess);
      } else {
        // Create
        oProcess = new GenProcess(aRequestDetails);
        await oProcess.save();
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_INSERTED', 200, oProcess);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public processUpdate = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cProcessCode, cProcessName, cProcessDesc, iStatusID } = body;
      const aMessageFields = {
        cProcessCode,
        cProcessName,
        cProcessDesc,
        iStatusID: iStatusID,
        iUpdatedby: event.requestContext.authorizer._id,
        tUpdated: new Date()
      };

      let oProcess = await GenProcess.findOne({ _id: event.pathParameters.id }).lean() as IProcess;

      if (oProcess) {
        oProcess = await GenProcess.findOneAndUpdate(
          { _id: event.pathParameters.id },
          { $set: aMessageFields },
          { new: true }
        ).lean() as IProcess;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_UPDATED', 200, oProcess);

      } else {
        return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public processDelete = async (event) => {
    let oProcess = await GenProcess.findOne({ _id: event.pathParameters.id }).lean() as IProcess;
    if (oProcess) {
      await GenProcess.deleteOne({ _id: event.pathParameters.id }).then(result => {
        return true;
      });
      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PROCESS', 'PROCESS_DELETED', 200, event.pathParameters.id);
    } else {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }
}
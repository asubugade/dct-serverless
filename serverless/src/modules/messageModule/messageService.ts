import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getMessageCount, getMessages } from "./messageDal";
import Message, { IMessage } from "../../models/GenMessage";



export class MessageService {
    private _oCommonCls = new ClsDCT_Common()

    public messageListing = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cModuleCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cMessageCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getMessageCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oMessages: any = await getMessages(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oMessages) {
                    let oMessageRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oMessages
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_LISTED', 200, oMessageRes);
                }
            } else {
                let oMessageRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_LISTED', 200, oMessageRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }


    public messageAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cModuleCode, cMessageCode, cDescription, iStatusID } = body;
            const aRequestDetails = { cModuleCode, cMessageCode, cDescription, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oMessage = await Message.findOne({ cModuleCode: cModuleCode, cMessageCode: cMessageCode }).lean() as IMessage;
            if (oMessage) {
                oMessage = await Message.findOneAndUpdate(
                    { cModuleCode: cModuleCode },
                    { $set: aRequestDetails },
                    { new: true }
                ) as IMessage;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_UPDATED', 200, oMessage);
            } else {
                oMessage = new Message(aRequestDetails);
                await oMessage.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_INSERTED', 200, oMessage);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public messageUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cModuleCode, cMessageCode, cDescription, iStatusID } = body;
            const aMessageFields = {
                cModuleCode,
                cMessageCode,
                cDescription,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oMessage = await Message.findOne({ _id: event.pathParameters.id }).lean();

            if (oMessage) {
                oMessage = await Message.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aMessageFields },
                    { new: true }
                ).lean();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_UPDATED', 200, oMessage);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : MESSAGE_UPDATED');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public messageDelete = async(event) =>{
        let oMessage = await Message.findOne({ _id: event.pathParameters.id }).lean() as IMessage;
        if (oMessage) {
          await Message.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_DELETED', 200, event.pathParameters.id);
        } else {
           return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : MESSAGE_DELETED');
        }
      }
}
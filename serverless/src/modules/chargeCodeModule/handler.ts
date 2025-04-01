import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import { ChargeCodeService } from "./chargeSodeService";

const _oCommonCls = new ClsDCT_Common();
const chargeCodeService = new ChargeCodeService()

module.exports.listHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        check("iOffset", "Offset is required").not().isEmpty();
        check("iLimit", "Offset is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await chargeCodeService.chargeCodeListing(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.addChargeCodeHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        check("cCode", "Charge Code is required").not().isEmpty();
        check("cName", "chargecode name is required").not().isEmpty();
        check("cChargegroup", "cChargegroup is required").not().isEmpty();
        check("cDefault", "cDefault is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await chargeCodeService.chargeCodeAdd(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateChargeCodeHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await chargeCodeService.chargeCodeUpdate(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteChargeCodeHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
      
        response = await chargeCodeService.chargeCodeDelete(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};
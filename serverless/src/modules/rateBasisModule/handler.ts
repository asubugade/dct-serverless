import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { RateBasisService } from "./rateBasisService";

const dbPromise = oConnectDB();
const rateBasisService = new RateBasisService()

module.exports.listHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        check("iOffset", "Offset is required").not().isEmpty();
        check("iLimit", "Offset is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await rateBasisService.rateBasisListing(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.addRateBasisHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        check("cBasis", "Ratebasis is required").not().isEmpty();
        check("cCode", "Ratebasis Code is required").not().isEmpty();
        check("cName", "Ratebasis name is required").not().isEmpty();
        check("cComment", "Ratebasis comment is required").not().isEmpty();
        check("iBasisGroupID", "Ratebasis groupID is required").not().isEmpty();
        check("cGlobalConversion", "Ratebasis GlobalConversion is required").not().isEmpty();
        check("cCSRFQConversion", "Ratebasis CSRFQConversion is required").not().isEmpty();
        check("bInland", "Ratebasis Inland is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await rateBasisService.rateBasisAdd(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateRateBasisHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await rateBasisService.rateBasisUpdate(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteRateBasisHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await rateBasisService.rateBasisDelete(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};
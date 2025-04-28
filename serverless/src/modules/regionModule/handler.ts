import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { RegionService } from "./regionService";
const dbPromise = oConnectDB();
const regionService = new RegionService()

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

        response = await regionService.regionListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.addRegionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        check("cCode", "Code is required").not().isEmpty();
        check("cName", "Name is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await regionService.regionAdd(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateRegionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        check("cCode", "Code is required").not().isEmpty();
        check("cName", "Name is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await regionService.regionUpdate(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteRegionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        response = await regionService.regionDelete(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};
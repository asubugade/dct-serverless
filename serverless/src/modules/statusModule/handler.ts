import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { StatusService } from "./statusService";
const dbPromise = oConnectDB();
const statusService = new StatusService()

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

        response = await statusService.statusListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.addStatusHandler = async (event, context, callback) => {
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

        response = await statusService.statusAdd(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateStatusHandler = async (event, context, callback) => {
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

        response = await statusService.statusUpdate(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deletestatusHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        response = await statusService.statusDelete(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};
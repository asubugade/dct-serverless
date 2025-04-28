import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { LocationService } from "./locationService";

const dbPromise = oConnectDB();
const locationService = new LocationService()


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

        response = await locationService.locationListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.addLocationHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
       await dbPromise;
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await locationService.locationAdd(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateLocationHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
       await dbPromise;
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await locationService.locationUpdate(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteLocationHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
       await dbPromise;


        response = await locationService.locationDelete(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


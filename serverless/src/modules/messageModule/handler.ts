import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { MessageService } from "./messageService";
const dbPromise = oConnectDB();

const messageService = new MessageService()

module.exports.listHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {    
        await dbPromise;
        check("iOffset", "Offset is required").not().isEmpty();
        check("iLimit", "Offset is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            return event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() });
        }

        response = await messageService.messageListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.addMessageHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {    
        await dbPromise;
        check("cModuleCode", "Module Code is required").not().isEmpty();
        check("cMessageCode", "Message Code is required").not().isEmpty();
        check("cDescription", "Message Description is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            return event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() });
        }

        response = await messageService.messageAdd(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.updateMessageHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {    
        await dbPromise;
        check("cModuleCode", "Access Code is required").not().isEmpty();
        check("cMessageCode", "Access Name is required").not().isEmpty();
        check("cDescription", "Access Description is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            return event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() });
        }

        response = await messageService.messageUpdate(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteMessageHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {    
        await dbPromise;
        response = await messageService.messageDelete(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


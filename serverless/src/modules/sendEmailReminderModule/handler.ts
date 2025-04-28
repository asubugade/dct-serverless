import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { SendEmailReminderService } from "./sendEmailReminderService";
const dbPromise = oConnectDB();
const sendEmailReminderService = new SendEmailReminderService()

module.exports.sendEmailReminderHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
        response = await sendEmailReminderService.sendEmailReminder(event);
        callback(null, response);
    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};
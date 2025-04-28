import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { MemberRestrictionService } from "./memberRestrictionService";
const dbPromise = oConnectDB();

const memberRestrictionService = new MemberRestrictionService()

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

        response = await memberRestrictionService.restrictionListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.addMemberRestrictionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        check("cType", "Type is required").not().isEmpty();
        check("cExceptionMessage", "Exception Message is required").not().isEmpty();
        check("cAllowedMemberAlias", "Allowed MemberAlias is required").not().isEmpty();
        check("cRestrictedMemberAlias", "Restricted MemberAlias is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            return event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() });
        }

        response = await memberRestrictionService.restrictionAdd(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.updateMemberRestrictionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        check("cType", "Type is required").not().isEmpty();
        check("cExceptionMessage", "Exception Message is required").not().isEmpty();
        check("cAllowedMemberAlias", "Allowed MemberAlias is required").not().isEmpty();
        check("cRestrictedMemberAlias", "Restricted MemberAlias is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            return event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() });
        }

        response = await memberRestrictionService.restrictionUpdate(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.deleteMemberRestrictionHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        const response = await memberRestrictionService.memberRestrictionDelete(event);
        callback(null, response)

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response)
    }
};
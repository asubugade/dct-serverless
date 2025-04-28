import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { MemberService } from "./memberService";
const dbPromise = oConnectDB();

const memberService = new MemberService()

module.exports.memberTemplateTypeHandler = async (event, context, callback) => {
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

        response = await memberService.memberListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.memberListHandler = async (event, context, callback) => {
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

        response = await memberService.memberListing(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.addMemberHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        check("cScac", "Member Code is required").not().isEmpty();
        check("cName", "Member Name is required").not().isEmpty();
        check("cAddress", "Address is required").not().isEmpty();
        check("cCity", "City is required").not().isEmpty();
        check("cState", "State is required").not().isEmpty();
        check("cPostalcode", "Postal code is required").not().isEmpty();
        check("cContinent", "Continent is required").not().isEmpty();
        check("cTel", "Telephone No is required").not().isEmpty();
        check("cFax", "Fax is required").not().isEmpty();
        check("cEmail", "Email is required").not().isEmpty();
        check("cContactperson", "Contatct person is required").not().isEmpty();
        check("cLocationcode", "Location code is required").not().isEmpty();
        check("cWebpage", "webpage is required").not().isEmpty();
        check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }
        response = await memberService.memberAdd(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};


module.exports.updateMemberHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        check("cScac", "Member Code is required").not().isEmpty();
      check("cName", "Member Name is required").not().isEmpty();
      check("cAddress", "Address is required").not().isEmpty();
      check("cCity", "City is required").not().isEmpty();
      check("cState", "State is required").not().isEmpty();
      check("cPostalcode", "Postal code is required").not().isEmpty();
      check("cContinent", "Continent is required").not().isEmpty();
      check("cTel", "Telephone No is required").not().isEmpty();
      check("cFax", "Fax is required").not().isEmpty();
      check("cEmail", "Email is required").not().isEmpty();
      check("cContactperson", "Contatct person is required").not().isEmpty();
      check("cLocationcode", "Location code is required").not().isEmpty();
      check("cWebpage", "webpage is required").not().isEmpty();
      check("iStatusID", "Status is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }
        response = await memberService.memberUpdate(event);

        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteMemberHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
       await dbPromise;
        response = await memberService.memberDelete(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

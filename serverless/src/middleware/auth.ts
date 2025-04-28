/**
 * Auth Middleware
 * Validate Permissions for each process and each user/user types
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */
import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { ClsDCT_ConfigIntigrations } from '../config/config';
import { Response, NextFunction } from "express";
import HttpStatusCodes from "http-status-codes";
import oJwt from "jsonwebtoken";
import Payload from "../types/Payload";
import Request from "../types/Request";
import User, { IUser } from "../models/GenUser";
import GenAccessType, { IAccessType } from "../models/GenAccessType"
import Permission, { IPermission } from "../models/GenPermission";
import Process, { IProcess } from "../models/GenProcess";
import { AccessControl } from 'role-acl';
import { Console } from 'console';
import Message, { IMessage } from "../models/GenMessage";
import { ClsDCT_Common } from '../commonModule/Class.common';
import { ClsDCT_User } from '../commonModule/Class.user';
import oConnectDB from '../config/database';
const dbPromise = oConnectDB();

//To Get Accesscode using iAccessTypeID
const getAccessCode = async (iAccessTypeID: object) => {
  try {
    return await GenAccessType.findOne({ _id: iAccessTypeID }, { _id: 0 }).select('cAccessCode');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

//To Get Processcode using iAccessTypeID
const getProcessCode = async (iProcessID: object) => {
  try {
    return await Process.findOne({ _id: iProcessID }, { _id: 0 }).select('cProcessCode');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

//To Get Permission along with AccessTypes,Processes and Attributes(cAdd/cEdit/cDelete/cView)
const oAccessTypes = async () => {
  try {
    const oGrantListDetails = await Permission.aggregate([
      {
        $lookup: {
          from: "gen_accesstypes",
          localField: "iAccessTypeID",
          foreignField: "_id",
          as: "oAccessTypes"
        }
      },
      { $unwind: "$oAccessTypes" },
      {
        $lookup: {
          from: "gen_processes",
          localField: "iProcessID",
          foreignField: "_id",
          as: "oProcess"
        }
      },
      { $unwind: "$oProcess" },
    ]);

    const oResetProcessType = new Array();
    for await (const [cKey, aPermissionDetails] of Object.entries(oGrantListDetails)) {
      if (aPermissionDetails.cAdd == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'create',
          ['attributes']: ['*']
        });
      }

      if (aPermissionDetails.cEdit == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'update',
          ['attributes']: ['*']
        });
      }

      if (aPermissionDetails.cView == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'read',
          ['attributes']: ['*']
        });
      }

      if (aPermissionDetails.cDelete == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'delete',
          ['attributes']: ['*']
        });
      }
    }

    return oResetProcessType;

  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


const FunDCT_ValidatePermission = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await dbPromise;
    const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
    const action = event.headers["action"];
    const resource = event.headers["resource"];
    let oConfIntegration = new ClsDCT_ConfigIntigrations();
    let cJwtSecret = oConfIntegration.cJwtSecret;
    const methodArn = event.methodArn;

    if (!cToken || !action || !resource) {
      let oCommonCls = new ClsDCT_Common();
      let oErrorDetails = await oCommonCls.FunDCT_MessageResponse('Error', 'AUTHENTICATION', 'TOKEN_MISSING', 401);
      let cErrorDescription = oCommonCls.cDescription;

      if (cErrorDescription) {
        return generatePolicy('anonymous', 'Deny', methodArn, {
          cModule: "AUTHENTICATION_",
          cErrorMessage: cErrorDescription,
        });
      }
    }

    const oPayload: Payload | any = oJwt.verify(cToken, cJwtSecret);
    event._id = oPayload._id;
    let oUserType: any = await User.findOne({ _id: oPayload._id }).lean();

    if (!oUserType) {
      return generatePolicy('anonymous', 'Deny', methodArn, {
        cModule: "AUTHENTICATION_",
        cErrorMessage: "User not found",
      });
    }

    let oUserCls = new ClsDCT_User();
    oUserCls.FunDCT_setEmail(oUserType.cEmail);
    oUserCls.FunDCT_setUserID(oUserType._id);
    oUserCls.FunDCT_setUsername(oUserType.cUsername);

    let iAccessTypeID = oUserType.iAccessTypeID;
    let oProcessType: any = await GenAccessType.findOne({ _id: iAccessTypeID }).exec();

    if (!oProcessType) {
      return generatePolicy('anonymous', 'Deny', methodArn, {
        cModule: "AUTHENTICATION_",
        cErrorMessage: "Invalid user type",
      });
    }

    let cUserType = oProcessType.cAccessCode;
    let aGrantList = await oAccessTypes();

    if (aGrantList) {
      const ac = new AccessControl(aGrantList);
      if (["create", "delete", "update", "read"].includes(action)) {
        const permission = await ac.can(cUserType).execute(action).on(resource);

        if (!permission.granted) {
          if (cUserType === 'Admin') {
            return generatePolicy(oPayload.iat, 'Allow', methodArn, { _id: event._id });
          } else {
            let oCommonCls = new ClsDCT_Common();
            let oErrorDetails = await oCommonCls.FunDCT_MessageResponse('Error', 'USER', 'INVALID_USER', 401);
            let cErrorDescription = oCommonCls.cDescription;
            if (cErrorDescription) {
              return generatePolicy('anonymous', 'Deny', methodArn, {
                cModule: "USER",
                cErrorMessage: cErrorDescription,
              });
            }
          }
        } else {
          return generatePolicy(oPayload.iat, 'Allow', methodArn, { _id: event._id });
        }
      }
    }

    return generatePolicy('anonymous', 'Deny', methodArn, {
      cModule: "AUTHENTICATION_",
      cErrorMessage: "Access Denied",
    });
  } catch (err) {
    console.error("Error in FunDCT_ValidatePermission:", err.message);
    return generatePolicy('anonymous', 'Deny', event.methodArn, {
      cModule: "AUTHENTICATION_",
      cErrorMessage: "Internal Server Error",
    });
  }
};




/**
 * added by stewari for menus and tabs according to permission
 * To Get Permission along with AccessTypes,Processes and Attributes(cAdd/cEdit/cDelete/cView) for single user
 * @param iAccessTypeID string
 * @returns array
 */
const oAccessTypesOfUser = async (iAccessTypeID = "") => {
  try {
    let arr = [
      { $match: { iAccessTypeID: iAccessTypeID } },
      {
        $lookup: {
          from: "gen_accesstypes",
          localField: "iAccessTypeID",
          foreignField: "_id",
          as: "oAccessTypes"
        }
      },
      { $unwind: "$oAccessTypes" },
      {
        $lookup: {
          from: "gen_processes",
          localField: "iProcessID",
          foreignField: "_id",
          as: "oProcess"
        }
      },
      { $unwind: "$oProcess" },
    ]

    const oGrantListDetails = await Permission.aggregate(arr)
    const oResetProcessType = new Array();
    for await (const [cKey, aPermissionDetails] of Object.entries(oGrantListDetails)) {
      if (aPermissionDetails.cAdd == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'create',
        });
      }

      if (aPermissionDetails.cEdit == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'update',
        });
      }

      if (aPermissionDetails.cView == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'read',
        });
      }

      if (aPermissionDetails.cDelete == 'Y') {
        oResetProcessType.push({
          ['role']: aPermissionDetails.oAccessTypes.cAccessCode,
          ['resource']: aPermissionDetails.oProcess.cProcessCode,
          ['action']: 'delete',
        });
      }
    }

    return oResetProcessType;

  } catch (err) {
    process.exit(1);
  }
}




const FunDCT_GetUserPermissions = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await dbPromise;

    const methodArn = event.methodArn || event.routeArn
    const cToken = event.authorizationToken;
    const oConfIntigration = new ClsDCT_ConfigIntigrations();
    const cJwtSecret = oConfIntigration.cJwtSecret;

    if (!cJwtSecret) {
      console.error("JWT Secret not configured");
      return generatePolicy('anonymous', 'Deny', methodArn, { error: "Server configuration error" });
    }


    if (!cToken) {
      console.error("No token provided");
      return generatePolicy('anonymous', 'Deny', methodArn, {
        error: "Missing authentication token"
      });
    }

    const oPayload: Payload | any = oJwt.verify(cToken, cJwtSecret);
    console.log("oPayload", oPayload);


    const oUserType: any = await User.findOne({ _id: oPayload._id }).lean();

    if (!oUserType) {
      console.error("User  not found");
      return generatePolicy(oPayload._id, 'Deny', methodArn, { error: "User  not found" });
    }

    const iAccessTypeID = oUserType.iAccessTypeID;
    const oProcessType: any = await GenAccessType.findOne({ _id: iAccessTypeID }).lean();

    if (!oProcessType) {
      console.error("Access type not found");
      return generatePolicy(oPayload._id, 'Deny', methodArn, { error: "Invalid access permissions" });
    }

    const cUserType = oProcessType.cAccessCode;

    // Build context object
    const contexts = {
      isAdmin: 'false',
      isDCTUser: 'false',
      isMemberUser: 'false',
      grantList: '[]'
    };

    if (cUserType === 'Admin') {
      contexts.isAdmin = 'true';
      return generatePolicy(oPayload._id, 'Allow', methodArn, contexts);
    }

    const aGrantList = await oAccessTypesOfUser(iAccessTypeID);
    contexts.grantList = JSON.stringify(aGrantList || []);

    if (cUserType === 'CENTRIC') contexts.isDCTUser = 'true';
    if (cUserType === 'Member') contexts.isMemberUser = 'true';

    return generatePolicy(oPayload._id, 'Allow', methodArn, contexts);

  } catch (err) {
    console.error("Authorization error:", err.message);
    return generatePolicy('anonymous', 'Deny', event.methodArn || 'arn:aws:execute-api:us-east-1:*:*/*/*/*', {
      error: "Authorization service unavailable"
    });
  }
};


const generatePolicy = (principalId, effect, resource, context = {}) => {
  if (!effect || !resource) {
    console.error("Invalid policy parameters");
    return {
      principalId: principalId || "anonymous",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [{
          Action: "execute-api:Invoke",
          Effect: "Deny",
          Resource: "*"
        }]
      },
      context
    };
  }

  // Validate and format ARN
  const validatedArn = resource.split('/').slice(0, 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: validatedArn
      }]
    },
    context
  };
};



export { FunDCT_ValidatePermission, oAccessTypes, FunDCT_GetUserPermissions };

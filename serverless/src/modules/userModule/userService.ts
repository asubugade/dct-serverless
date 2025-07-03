import oBcrypt from "bcryptjs";
import e, { Router, Response } from "express";
import { check, validationResult } from "express-validator";
import gravatar from "gravatar";
import HttpStatusCodes from "http-status-codes";
import oJwt from "jsonwebtoken";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import User, { IUser } from "../../models/GenUser";
import { ClsDCT_EmailTemplate } from '../../commonModule/Class.emailtemplate';

// import { ClsDCT_Common } from "../../commonModule/Class.common";
// import { ClsDCT_User } from "../../../module/Class.user";
// import Status, { IStatus } from "../../../models/GenStatus";
// import auth from "../middleware/auth";
// import { ClsDCT_Message } from "../../../module/Class.message";
import { isNumber } from "util";
import { TypeOfExpression } from "typescript";
import { Schema } from "mongoose";
import { count, error } from "console";
// import { FunDCT_ValidatePermission, FunDCT_GetUserPermissions } from "../../../middleware/auth";
// // import multer from 'multer';

// import { ClsDCT_Process } from '../../../module/Class.process';
// import { cloudWatchClass } from '../../../middleware/cloudWatchLogger';
import rateLimit from 'express-rate-limit';
import { getUser, getUserCount } from "./usersDal";
import Status, { IStatus } from "../../models/GenStatus";
import { ClsDCT_User } from "../../commonModule/Class.user";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import moment from "moment";

const oMimeType = require('mime-types');

//code added by spirgonde for insert profile image to s3 bucket start 
const multer = require('multer');
// const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
const fs = require("fs");
dotenv.config();
//code added by spirgonde for insert profile image to s3 bucket  end

// const router: Router = Router();

export class GenUserService {

  private encryptedPassword: string; //code added by spirgonde

  // private _router = Router();
  private _oCommonCls = new ClsDCT_Common();
  // private _oManageTemplateCls = new ClsDCT_User();


  public _oStorage: any;
  public upload: any;
  public _oFileUpload: any;
  public _cFileTypeProfileImage: any;
  public _cTempProfileImg: any;

  private _oEmailTemplateCls = new ClsDCT_EmailTemplate();
  // private _oProcessCls = new ClsDCT_Process();


  public bPurl: boolean = false;
  public cPresignedUrl;
  public cUploadKey: string = '';
  public cNoPIMsg = 'File Not provided or Invalid file was provided at the time of User Creation';



  constructor() {
    // this._oStorage = multer.diskStorage({
    //   destination: (oReq, file, cb) => {
    //     cb(null, this._oCommonCls.cDirProfileImagePath);
    //   },
    //   filename: (oReq, file, cb) => {
    //     let cOriginalFileName = file.filename.split('.').slice(0, -1).join('.');
    //     this._cTempProfileImg = cOriginalFileName + '_' + Date.now();
    //     this._cFileTypeProfileImage = file.filename.substring(file.filename.lastIndexOf('.'), file.filename.length)
    //     cb(null, this._cTempProfileImg + this._cFileTypeProfileImage);
    //   }
    // });

    // this._oFileUpload = multer({
    //   storage: this._oStorage
    // });
  }



  public userListing = async (event) => {
    try {
      const body = JSON.parse(event.body)
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

      let cSearchFilterQuery: any;
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery = {
          $match: {
            $or: [
              // below line of code added  by spirognde so that user can also search using acces types(admin,dct,member)
              { "oAccessTypeListing.cAccessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
              { "cEmail": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
              { "cUsername": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
            ]
          }
        };
      } else {
        cSearchFilterQuery = { $match: {} };
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      let iCount: number = await getUserCount(cSearchFilterQuery);
      if (iCount > 0) {
        let oUser: any = await getUser(aRequestDetails, oSort, cSearchFilterQuery, iCount);
        if (oUser) {
          let oUserRes = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: oUser
          };
          return await this.FunDCT_Handleresponse('Success', 'USER', 'USER_LISTED', 200, oUserRes, event);
        }
      } else {
        let oUserRes = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this.FunDCT_Handleresponse('Success', 'USER', 'USER_LISTED', 200, oUserRes, event);
      }
    } catch (err) {
      return await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', event);
    }

  }



  public profile = async (oReq) => {
    try {
      const body = JSON.parse(oReq.body);
      const cToken = oReq.headers?.['x-wwadct-token'] || oReq.headers?.['X-WWADCT-TOKEN'];
      if (!cToken) {
        return this.FunDCT_Handleresponse(
          "Error",
          "AUTHENTICATION",
          "TOKEN_MISSING",
          HttpStatusCodes.BAD_REQUEST,
          "SERVER_ERROR",
          oReq
        );
      }

      const payload: any = oJwt.verify(cToken, this._oCommonCls.cJwtSecret);

      oReq._id = payload._id;
      let user: any = await User.findOne({ _id: payload._id }).lean();
      if (!user || user._id.toString() !== payload._id) {
        return this.FunDCT_Handleresponse(
          "Error",
          "USER",
          "USER_UNKNOWNPROFILE",
          HttpStatusCodes.BAD_REQUEST,
          "SERVER_ERROR",
          oReq
        );
      }

      let resUser = oReq.requestContext?.authorizer?.grantList
      if (body.profileImgUrl === true) {
        if (!this.bPurl || user.cAvatar !== this.cUploadKey) {
          if (user.cAvatar === this.cNoPIMsg) {
            this.cPresignedUrl = null;
          } else {
            this.cPresignedUrl = await this._oCommonCls.FunDCT_getPresignedUrl(
              user.cAvatar
            );
          }
          this.cUploadKey = user.cAvatar;
          this.bPurl = true;
        }
      }
      resUser = body.profileImgUrl == true ? {
        oGrantlist: resUser ? JSON.parse(resUser) : resUser,
        ...user,
        isAdmin: oReq.requestContext?.authorizer?.isAdmin === "true",  // Convert string "true"/"false" to boolean
        isDCTUser: oReq.requestContext?.authorizer?.isDCTUser === "true",
        isMemberUser: oReq.requestContext?.authorizer?.isMemberUser === "true",
        cAvatar: user.cAvatar,
        cProfileImgUrl: this.cPresignedUrl,
      } :
        {
          oGrantlist: resUser ? JSON.parse(resUser) : resUser,
          ...user,
          isAdmin: oReq.requestContext?.authorizer?.isAdmin === "true",  // Convert string "true"/"false" to boolean
          isDCTUser: oReq.requestContext?.authorizer?.isDCTUser === "true",
          isMemberUser: oReq.requestContext?.authorizer?.isMemberUser === "true"
        };

      return this.FunDCT_Handleresponse(
        "Success",
        "USER",
        "VALIDATE_USER",
        200,
        resUser,
        oReq,
        // cToken
      );
    } catch (err) {
      console.error("Error: ", err);
      return {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }


  public userDelete = async (event) => {

    try {
      const id = event.pathParameters.id;
      let oUser: any = await User.findOne({ _id: id });
      if (oUser) {
        await User.deleteOne({ _id: id }).then(result => {
          return true;
        });
        return await this.FunDCT_Handleresponse('Success', 'MESSAGE', 'MESSAGE_DELETED', 200, id, event);
      } else {
        return await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', oUser);
      }
    } catch (err) {
      console.error("Error: ", err);
      return {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ error: err.message }),
      };
    }

  }


  public userAddUpdate = async (event, formData) => {
    try {
      let oStatus;
      oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;

      let cAvatar: string = "";
      if (formData.files.length > 0) {
        let cOriginalFileName = formData.files[0].filename.split('.').slice(0, -1).join('.');
        this._cTempProfileImg = cOriginalFileName + '_' + Date.now();
        this._cFileTypeProfileImage = formData.files[0].filename.substring(formData.files[0].filename.lastIndexOf('.'), formData.files[0].filename.length)
      }
      try {
        let filepaths3 = `${this._oCommonCls.cAWSBucketEnv}/${this._oCommonCls.cAWSBucketProfileImage}/` + this._cTempProfileImg + this._cFileTypeProfileImage;

        if ((this._cTempProfileImg === undefined || this._cTempProfileImg === null) ||
          (this._cFileTypeProfileImage === undefined || this._cFileTypeProfileImage === null)) {
          cAvatar = 'File Not provided or Invalid file was provided at the time of User Creation';
        }
        else {
          // let cImgPathLocal;
          // cImgPathLocal = this._oCommonCls.cDirProfileImagePath + this._cTempProfileImg + this._cFileTypeProfileImage;
          const fileContent = formData.files[0].content;

          // let typeC= oMimeType.lookup(cImgPathLocal)
          // const b4Data = `data:${typeC};base64,${fileContent.toString('base64')}`;
          let response: any = await this._oCommonCls.FunDCT_UploadProfileImage(fileContent, filepaths3);
          cAvatar = response;
          this._cTempProfileImg = null;
          this._cFileTypeProfileImage = null;
        }
        /**
         * Modification ENDS.
         */
      } catch (error) {
        this._oCommonCls.log('Something went wrong while uploading profile Image! ' + error);
      }
      // code added by spirgonde for insert profile image to s3 bucket end
      const { iAccessTypeID, cTemplateType, cEmail, cPassword, cName, cUsername, cCompanyname, cAddress, cCity, cPostalcode, cState, cPhone, cFax } = formData;
      // const salt = await oBcrypt.genSalt(10);
      // const cPassword = await oBcrypt.hash(cUsername, salt);
      let passwordHistory = [];
      let aRequestDetails: any = { iAccessTypeID, cTemplateType: cTemplateType, cEmail, cPassword, passwordHistory, cAvatar, cName, cUsername, cCompanyname, cAddress, cCity, cPostalcode, cState, cPhone, cFax, iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };
      if (formData.cPassword) {
        aRequestDetails.lastPasswordReset = moment().toDate()
      }

      let oUser = await User.findOne({ iAccessTypeID: iAccessTypeID, cEmail: cEmail }).lean() as IUser;
      if (oUser) {
        // Update
        const salt = await oBcrypt.genSaltSync(10);
        let encryptedPassword = await oBcrypt.hashSync(cPassword, salt);
        if (oUser.passwordHistory.length >= 3) {
          oUser.passwordHistory.pop();
        }
        oUser.passwordHistory.unshift(encryptedPassword);

        oUser = await User.findOneAndUpdate(
          { iAccessTypeID: iAccessTypeID },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as IUser;
        return await this.FunDCT_Handleresponse('Success', 'USER', 'USER_UPDATED', 200, oUser, event);
      } else {
        // Create
        oUser = new User(aRequestDetails);    // code added by spirgonde
        const salt = await oBcrypt.genSaltSync(10);
        this.encryptedPassword = await oBcrypt.hashSync(oUser.cPassword, salt);
        oUser.cPassword = this.encryptedPassword; //code end by spirgonde 
        oUser.passwordHistory.push(this.encryptedPassword);
        await oUser.save();
        return await this.FunDCT_Handleresponse('Success', 'USER', 'USER_INSERTED', 200, oUser, event);
      }
    } catch (err) {
      return await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', event);
    }
  }

  public userUpdate = async (event, formData) => {
    try {

      if (formData.files.length > 0) {
        let cOriginalFileName = formData.files[0].filename.split('.').slice(0, -1).join('.');
        this._cTempProfileImg = cOriginalFileName + '_' + Date.now();
        this._cFileTypeProfileImage = formData.files[0].filename.substring(formData.files[0].filename.lastIndexOf('.'), formData.files[0].filename.length)
      }
      let oStatus;
      try {
        oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
      } catch (error) {
        throw new Error
      }
      //const cAvatar = this._oCommonCls.cDirProfileImagePath + this._cTempProfileImg + this._cFileTypeProfileImage;
      // code added by spirgonde for insert profile image to s3 bucket start
      /**
       * code modified by spirgonde so that even if user does not provide profile image at the time of profile creation ,User profile will
       * still be inserted with cAvatar being saved in db as follows:
       * cAvatar = 'File Not provided or Invalid file was provided at the time of User Creation';
       * modification STARTS.....
       */
      let cAvatar: string = "";
      let bProfileImg: boolean = false;
      let aUserFields;
      try {
        let filepaths3 = `${this._oCommonCls.cAWSBucketEnv}/${this._oCommonCls.cAWSBucketProfileImage}/` + this._cTempProfileImg + this._cFileTypeProfileImage;

        if ((this._cTempProfileImg === undefined || this._cTempProfileImg === null) ||
          (this._cFileTypeProfileImage === undefined || this._cFileTypeProfileImage === null)) {
          cAvatar = 'File Not provided or Invalid file was provided at the time of User Creation';
          bProfileImg = false;
        }
        else {
          // let cImgPathLocal;
          // cImgPathLocal = this._oCommonCls.cDirProfileImagePath + this._cTempProfileImg + this._cFileTypeProfileImage;
          const fileContent = formData.files[0].content;
          // let typeC= oMimeType.lookup(cImgPathLocal)
          // const b4Data = `data:${typeC};base64,${fileContent.toString('base64')}`;
          let response: any = await this._oCommonCls.FunDCT_UploadProfileImage(fileContent, filepaths3);
          cAvatar = response;
          this._cTempProfileImg = null;
          this._cFileTypeProfileImage = null;
          bProfileImg = true;
        }
        /**
         * Modification ENDS.
         */
      } catch (error) {
        this._oCommonCls.log('Something went wrong while uploading profile Image! ' + error);
      }
      // code added by spirgonde for insert profile image to s3 bucket end

      const salt = await oBcrypt.genSalt(10);
      const { iAccessTypeID, cTemplateType, cEmail, cName, cUsername, cCompanyname, cAddress, cCity, cPostalcode, cState, cPhone, cFax, iStatusID } = formData;
      // const cPassword = await oBcrypt.hash(cUsername, salt);
      //code added by spirgonde for cPassword issue Start ...

      if (formData.cPassword) {
        const cPassword = await oBcrypt.hash(formData.cPassword, salt);//code added by spirgonde for edit pasword
        aUserFields = {
          iAccessTypeID, cTemplateType: cTemplateType, cEmail, cPassword, cName, cUsername, cCompanyname, cAddress, cCity, cPostalcode, cState,
          cPhone, cFax, iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date(), cAvatar: cAvatar, lastPasswordReset: moment().toDate(),
        };
      }
      else {
        aUserFields = {
          iAccessTypeID, cTemplateType: cTemplateType, cEmail, cName, cUsername, cCompanyname, cAddress, cCity, cPostalcode, cState,
          cPhone, cFax, iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date(), cAvatar: cAvatar
        };
      }
      //code added by spirgonde for cPassword issue End.

      if (!bProfileImg) {
        delete aUserFields.cAvatar;
      }

      let oUser = await User.findOne({ _id: event.pathParameters.id }).lean() as IUser;

      if (oUser) {
        if (oUser.passwordHistory.length > 0) {
          aUserFields.passwordHistory = oUser.passwordHistory;
        }
        else {
          aUserFields.passwordHistory = [];
        }
        if (oUser.passwordHistory.length >= 3) {
          aUserFields.passwordHistory.pop();
        }
        aUserFields.passwordHistory.unshift(aUserFields.cPassword);

        oUser = await User.findOneAndUpdate(
          { _id: event.pathParameters.id },
          { $set: aUserFields },
          { new: true }
        ).lean() as IUser;
        return await this.FunDCT_Handleresponse('Success', 'USER', 'USER_UPDATED', 200, oUser, event);

      } else {
        return await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', event);
      }
    } catch (err) {
      return await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', err);
    }
  }


  public generateOTP = async (event) => {
    const { cUsername } = JSON.parse(event.body);
    try {
      this._oCommonCls.FunDCT_ApiRequest(event)
      // let oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
      // if (!oStatus) {
      //   throw new error
      // }
      // let iStatusID = oStatus._id;
      let oUser = await User.findOne({ cUsername: cUsername }).lean() as IUser;
      if (oUser) {
        this._oCommonCls.FunDCT_SetRandomStr(6, 'iNumber');
        let iOTP = this._oCommonCls.FunDCT_GetRandomStr();
        const aUserFields = {
          cPwdToken: iOTP
        };

        oUser = await User.findOneAndUpdate(
          { cUsername: cUsername },
          { $set: aUserFields },
          { new: true }
        ).lean() as IUser;

        //Send Email Notification using Email Template
        var aVariablesVal = {
          DCTVARIABLE_USERNAME: cUsername,
          DCTVARIABLE_OTP: iOTP
        };

        // Below line of code commented by spirgonde. 
        // await this._oEmailTemplateCls.FunDCT_SendNotification('USER', 'Retrieve Password OTP', aVariablesVal, this._oCommonCls.cEmail)
        await this._oEmailTemplateCls.FunDCT_SendNotification('USER', 'Retrieve Password OTP', aVariablesVal, oUser.cEmail)

        return {
          statusCode: HttpStatusCodes.OK,
          body: JSON.stringify({ msg: "OTP Generate Successfully. Please check email." }),
        }
      } else {
        return {
          statusCode: HttpStatusCodes.OK,
          body: JSON.stringify({ msg: "User does not exists" }),
        }
      }

      // this._oCommonCls.log('FunDCT_GenerateOTP ApiRequest: ' + event)

    } catch (err) {
      return {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ error: err.message }),
      }
    }
  }


  public verifyOTP = async (event) => {
    try {
      const { cUsername, cPwdToken } = JSON.parse(event.body);

      const oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean();
      if (!oStatus) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Status is not ACTIVE' }),
        };
      }

      const user = await User.findOne({ cUsername, cPwdToken }).lean() as IUser;

      if (!user) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid OTP' }),
        };
      }

      const payload: Payload = {
        userId: user.id,
        _id: user._id,
        iAccessTypeID: user.iAccessTypeID,
        cEmail: user.cEmail,
        cAvatar: user.cAvatar,
        cName: user.cName,
        cUsername: user.cUsername,
        cCompanyname: user.cCompanyname,
        cAddress: user.cAddress,
        cCity: user.cCity,
        cPostalcode: user.cPostalcode,
        cState: user.cState,
        cPhone: user.cPhone,
        cFax: user.cFax,
      };

      const token = oJwt.sign(payload, this._oCommonCls.cJwtSecret, {
        expiresIn: this._oCommonCls.cJwtExpiration,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ user, token }),
      };

    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server Error', message: err.message }),
      };
    }
  }

  public forgotPass = async (event) => {
    try {
      const { cUsername, cPassword, newPassword } = JSON.parse(event.body);

      if (!cUsername || !cPassword || !newPassword) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing required fields' }),
        };
      }


      let user = await User.findOne({ cUsername }) as IUser;
      if (!user) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User not found' }),
        };
      }


      if (!Array.isArray(user.passwordHistory)) {
        user.passwordHistory = [];
      }

      if (Array.isArray(user.passwordHistory) && user.passwordHistory.length > 0) {
        // Filter out null or non-string values before comparison
        const validPasswordHistory = user.passwordHistory
          .filter(p => typeof p === 'string' && p !== null)
          .slice(0, 3); // Consider only last 3 valid passwords

        const passwordMatchInHistory = await Promise.all(
          validPasswordHistory.map(async (oldPassword) => {
            return await oBcrypt.compare(newPassword, oldPassword);
          })
        );

        if (passwordMatchInHistory.some(isMatch => isMatch)) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'New password must not match any of the last 3 passwords' }),
          };
        }
      }



      // Hash the new password
      const salt = await oBcrypt.genSalt(10);
      const hashedNewPassword = await oBcrypt.hash(newPassword, salt);

      // user.cPassword = hashedNewPassword;

      // if (user.passwordHistory.length >= 3) {
      //   user.passwordHistory.pop();
      // }
      // user.passwordHistory.unshift(hashedNewPassword);

      // await user.save();

      const updatedHistory = [hashedNewPassword, ...user.passwordHistory.slice(0, 2)];

      // Update user document without triggering full validation
      await User.updateOne(
        { cUsername },
        {
          $set: {
            cPassword: hashedNewPassword,
            passwordHistory: updatedHistory,
            lastPasswordReset: new Date(), // Update last password reset time
          },
        }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ msg: 'Password updated successfully', cUsername: user.cUsername }),
      };

    } catch (err) {
      console.error('Error updating password:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ err: 'Server error' }),
      };
    }
  }






  /**
* To Handle response according to Module and Status String using FunDCT_MessageResponse common class function
* @param cType string
* @param cModule string
* @param cStatusString string
* @param iStatusCode number
* @param oDetails any
* @param req Request
* @param res Response
*/
  public async FunDCT_Handleresponse(
    cType: string,
    cModule: string,
    cStatusString: string,
    iStatusCode: number,
    oDetails: any,
    req: Request,
    // cToken: string = ""
  ) {
    try {
      let cToken = req.headers?.['x-wwadct-token'] || req.headers?.['X-WWADCT-TOKEN'];
      if (cToken) {
        await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
      }

      await this._oCommonCls.FunDCT_MessageResponse(cType, cModule, cStatusString, 401);
      this._oCommonCls.FunDCT_ApiRequest(req);

      if (cType === "Error") {
        console.error("Error:", oDetails);
      } else {
      }

      return {
        statusCode: iStatusCode,
        body: JSON.stringify({
          cModule: "APPLICATION",
          cMessage: this._oCommonCls.cDescription || "Success",
          cDetails: oDetails,
          cToken: cToken,
          cType: cType,
        }),
      };
    } catch (err) {
      return {
        statusCode: iStatusCode,
        body: JSON.stringify({
          cModule: "UNKNOWN_MODULE",
          cErrorMessage: "Please contact the support team for this issue.",
          cDetails: "UNKNOWN_DETAILS",
        }),
      };
    }
  }

}
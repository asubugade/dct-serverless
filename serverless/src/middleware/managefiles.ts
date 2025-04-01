/**
 * Manage Files Middleware
 * File Upload
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

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
import fs from 'fs';
import multer from 'multer';

/**
 * To Upload Files
 * 
 * @param cAction string
 * @param cResource string
 */
const FunDCT_UploadFiles = function (cUsage: string) {
  return async (oReq: Request, oRes: Response, next: NextFunction) => {
    switch (cUsage) {
      case 'ExcelToJSON-Import-Headers':
        // this.oStorage = multer.diskStorage({
        //   destination: (oReq, file, cb) => {
        //     cb(null, this.cDirTemplateImportExcelToJSONHeader)
        //   },
        //   filename: (oReq, file, cb) => {
        //     this.cTempFileImportExcelToJSON = file.fieldname + "-" + Date.now() + "-" + file.originalname;
        //     cb(null, this.cTempFileImportExcelToJSON)
        //   }
        // });
        // this.oFileUpload = multer({ storage: this.oStorage });
        // this.oFileUpload.single("uploadfile");

        

        multer.diskStorage({
          destination: (oReq, file, cb) => {
            cb(null, this.cDirTemplateImportExcelToJSONHeader)
          },
          filename: (oReq, file, cb) => {
            this.cTempFileImportExcelToJSON = file.fieldname + "-" + Date.now() + "-" + file.originalname;
            cb(null, this.cTempFileImportExcelToJSON)
          }
        });

        break;

      default:
        break;
    }
  }
}

export default FunDCT_UploadFiles;

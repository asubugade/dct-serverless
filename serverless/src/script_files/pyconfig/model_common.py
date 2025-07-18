from pyconfig import ConfigurationMessageHandling
from pyconfig.dbconnection import Database
import shutil
from pathlib import Path
import sys
import inspect
import os
import json
import datetime
import xml.etree.cElementTree as ET
from collections import defaultdict
from shutil import copyfile
from datetime import datetime
from bson.objectid import ObjectId
from jinja2 import Template
from pyconfig.LogService import LogService
from EmailService import EmailService
from pyconfig import loadConfig
from EmailSmtpClient import EmailSMTPClient
import re
path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(0, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(
    os.path.split(inspect.getfile(inspect.currentframe()))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)

FRONTEND_URI = loadConfig.FRONTEND_URI_LOCAL
smtp_client = EmailSMTPClient()
class model_common_Cls:
    statusActive : any
    statusDefalt:any
    statusInActive:any
    oDb = Database()
    oPyDB = oDb.oPyDB
    def __init__(self) -> None:
        self.statusActive = self.FunDCT_GetStatusByStatusCode('ACTIVE')
        self.statusDefalt = self.FunDCT_GetStatusByStatusCode('Default')
        self.statusInActive = self.FunDCT_GetStatusByStatusCode('INACTIVE')
        
        
    
    def FunDCT_GetStatusByStatusCode(self,cStatusCodeVal):
        try:
            oRow = self.oPyDB.gen_statuses.find(
                {'cStatusCode': cStatusCodeVal})
            return list(oRow)
        except Exception as e:
            LogService.log('Error : FunDCT_GetStatusByStatusCode Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetStatusByStatusCode Error while parsing file due to ' + str(e))

    def FunDCT_getUserRole(self, userid):
        try:
            pipline = [{"$lookup": {"from": "gen_accesstypes","localField": "iAccessTypeID","foreignField": "_id","as": "oAccess"}},{"$match": {"_id":ObjectId(userid)}}]

            rold = self.oPyDB.gen_users.aggregate(pipline)
            for acc in  rold:
                for c in acc.get('oAccess'):
                    return c.get('cAccessCode')
            return []

        except Exception as e:
            LogService.log('Error : FunDCT_GetMember Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMember Error while parsing file due to ' + str(e))


    def FunDCT_GetCompny(self,userid):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetMember = self.oPyDB.gen_users.find(
                {'_id': ObjectId(userid),'iStatusID': cActiveStatusID})
            return list(oGetMember)
        except Exception as e:
            LogService.log('Error : FunDCT_GetMember Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMember Error while parsing file due to ' + str(e))

    def FunDCT_GetMember(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetMember = self.oPyDB.gen_members.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetMember)
        except Exception as e:
            LogService.log('Error : FunDCT_GetMember Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMember Error while parsing file due to ' + str(e))

    def FunDCT_CheckMemberbySCAC(self,val):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetMember = self.oPyDB.gen_members.find(
                {'iStatusID': cActiveStatusID,'cScac':val})
            if len(list(oGetMember)) > 0:
                return True
            else :
                return False
        
        except Exception as e:
            LogService.log('Error : FunDCT_GetMember Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMember Error while parsing file due to ' + str(e))


    def FunDCT_GetEmailFromCompanyName(self,cCompanyname):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetCompanyName = self.oPyDB.gen_members.find(
                {'iStatusID': cActiveStatusID, 'cScac': cCompanyname})
            return oGetCompanyName[0]['cEmail']
        except Exception as e:
            LogService.log('Error : FunDCT_GetEmailFromCompanyName Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetEmailFromCompanyName Error while parsing file due to ' + str(e))


    def FunDCT_GetRegions(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetRegions = self.oPyDB.gen_regions.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetRegions)
        except Exception as e:
            LogService.log('Error : FunDCT_GetRegions Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetRegions Error while parsing file due to ' + str(e))

    def FunDCT_checkRegions(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetRegions = self.oPyDB.gen_regions.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            if len(list(oGetRegions)) > 0:
                return True
            else:
                return False
        except Exception as e:
            LogService.log('Error : FunDCT_GetRegions Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetRegions Error while parsing file due to ' + str(e))


    def FunDCT_GetCountries(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetCountries = self.oPyDB.gen_countries.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetCountries)
        except Exception as e:
            LogService.log('Error : FunDCT_GetRegions Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetCountries Error while parsing file due to ' + str(e))

    def FunDCT_CheckCountries(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetCountries = self.oPyDB.gen_countries.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            if len(list(oGetCountries))>0:
                return True
            else:
                return False
        except Exception as e:
            LogService.log('Error : FunDCT_GetRegions Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetCountries Error while parsing file due to ' + str(e))


    def FunDCT_GetLocations(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetLocations = self.oPyDB.gen_locations.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetLocations)
        except Exception as e:
            LogService.log('Error : FunDCT_GetLocations Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetLocations Error while parsing file due to ' + str(e))

    def FunDCT_CheckLocations(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetLocations = self.oPyDB.gen_locations.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            
            if len(list(oGetLocations))>0:
                return True
            else:
                return False

        except Exception as e:
            LogService.log('Error : FunDCT_GetLocations Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetLocations Error while parsing file due to ' + str(e))


    def FunDCT_GetCurrency(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetCurrency = self.oPyDB.gen_currencies.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetCurrency)
        except Exception as e:
            LogService.log('Error : FunDCT_GetCurrency Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetCurrency Error while parsing file due to ' + str(e))

    def FunDCT_CheckCurrency(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetCurrency = self.oPyDB.gen_currencies.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            if len(list(oGetCurrency))>0:
                return True
            else:
                return False
        except Exception as e:
            LogService.log('Error : FunDCT_GetCurrency Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetCurrency Error while parsing file due to ' + str(e))

    def FunDCT_GetBasis(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetBasis = self.oPyDB.gen_basises.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetBasis)
        except Exception as e:
            LogService.log('Error : FunDCT_GetBasis Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetBasis Error while parsing file due to ' + str(e))

    def FunDCT_CheckBasis(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetBasis = self.oPyDB.gen_basises.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            if len(list(oGetBasis)) > 0:
                return True
            else:
                return False
        except Exception as e:
            LogService.log('Error : FunDCT_GetBasis Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetBasis Error while parsing file due to ' + str(e))


    def FunDCT_GetChargecode(self):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetChargecode = self.oPyDB.gen_chargecodes.find(
                {'iStatusID': cActiveStatusID})
            return list(oGetChargecode)
        except Exception as e:
            LogService.log('Error : FunDCT_GetChargecode Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetChargecode Error while parsing file due to ' + str(e))

    def FunDCT_CheckChargecode(self,cCode):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetChargecode = self.oPyDB.gen_chargecodes.find(
                {'iStatusID': cActiveStatusID,'cCode':cCode})
            if len(list(oGetChargecode)) > 0:
                return True    
            else:
                return False
        except Exception as e:
            LogService.log('Error : FunDCT_GetChargecode Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetChargecode Error while parsing file due to ' + str(e))



    def FunDCT_GetValidationMessage(self,cModuleCode='ALL', cMessageCode='ALL'):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            if cModuleCode == 'ALL' and cMessageCode == 'ALL':
                oGetValidationMessage = self.oPyDB.gen_messages.find(
                    {'iStatusID': cActiveStatusID})
            else:
                oGetValidationMessage = self.oPyDB.gen_messages.find(
                    {'iStatusID': cActiveStatusID, 'cModuleCode': cModuleCode, 'cMessageCode': cMessageCode})
            return list(oGetValidationMessage)
        except Exception as e:
            
            LogService.log('Error : FunDCT_GetValidationMessage Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetValidationMessage Error while parsing file due to ' + str(e))

    def FunDCT_GetMemeberDistributedFile(self,iTemplateID, memberscac):
        try:
            data = self.oPyDB.tmpl_uploadlogs.find({"iTemplateID":ObjectId(iTemplateID)})
            
            if data:
                # ids = data['_id']
                # LogService.log(f'tmpl_upload id ==> {ids}')
                # odata = self.oPyDB.tmpl_uploadlogs.find({"_id":ObjectId(ids)},{"cDistributionDetails":1 })

                # LogService.log(f'DATA Found,{data}')
                if data:
                    for nData in data:
                        if  nData.get('cDistributionDetails') is not None:
                            dData = nData['cDistributionDetails']
                            for e in dData:
                                if dData[e]['cDistScaccode'] == memberscac:
                                    LogService.log(dData[e]['cMemberDistributionFilePath'])
                                    return dData[e]['cMemberDistributionFilePath']
            LogService.log('Returning DATA blank')
            return ''
        except Exception as e:
            LogService.log('Error : FunDCT_GetMemeberDistributedFile  Error while Fetching S3  file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMemeberDistributedFile  Error while Fetching  file path due to ' + str(e))

    def FunDCT_GetMembersForDistribution(self,iTemplateUploadLogID, _cUploadType):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            if _cUploadType != 'DISTRIBUTE':
                oTemplateLogDetails = self.oPyDB.mem_uploadlogs.find(
                    {'iStatusID': ObjectId(cActiveStatusID), "_id": ObjectId(iTemplateUploadLogID)})
                return oTemplateLogDetails[0]['cScacCode']
            else:
                oTemplateLogDetails = self.oPyDB.tmpl_uploadlogs.find(
                    {'iStatusID': cActiveStatusID, "_id": ObjectId(iTemplateUploadLogID)})
                return list(oTemplateLogDetails[0]['cSelectedMembers'])
        except Exception as e:
            LogService.log('Error : FunDCT_GetMembersForDistribution  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMembersForDistribution  Error while parsing file due to ' + str(e))


    def FunDCT_GetMaxDepthHeader(self,iTemplateID):
        try:
            # oGetActiveStatus = FunDCT_GetStatusByStatusCode('ACTIVE')
            # cActiveStatusID = oGetActiveStatus[0]['_id']
            # 'iStatusID': cActiveStatusID,
            oTemplateDataDetails = self.oPyDB.tmpl_metadatas.find(
                {"iTemplateID": ObjectId(iTemplateID)})
            return oTemplateDataDetails[0]['iMaxDepthHeaders']
        except Exception as e:
            LogService.log('Error : FunDCT_GetMaxDepthHeader  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMaxDepthHeader  Error while parsing file due to ' + str(e))


    def FunDCT_GetMemberScacValidationCol(self,iTemplateID):
        try:
            oTemplateLogDetails = self.oPyDB.tmpl_metadatas.aggregate(
                [{"$match": {
                    "$or": [{"aTemplateHeader.cValidationsCondition": 'DEFAULT_OCEAN_SCAC'},{"aTemplateHeader.cValidationsCondition": 'DEFAULT_ORIGIN_SCAC'},{"aTemplateHeader.cValidationsCondition": 'DEFAULT_DESTINATION_SCAC'}],
                    "$and":[{"iTemplateID": ObjectId(iTemplateID)}]

                }},
                    {"$unwind": "$aTemplateHeader"},
                    {"$match": {
                    "$or": [{"aTemplateHeader.cValidationsCondition": 'DEFAULT_SCAC'},{"aTemplateHeader.cValidationsCondition": 'DEFAULT_OCEAN_SCAC'},{"aTemplateHeader.cValidationsCondition": 'DEFAULT_ORIGIN_SCAC'},{"aTemplateHeader.cValidationsCondition": 'DEFAULT_DESTINATION_SCAC'}],
                    "$and":[{"iTemplateID": ObjectId(iTemplateID)}]
                    }}])
            return list(oTemplateLogDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_GetMemberScacValidationCol  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMemberScacValidationCol  Error while parsing file due to ' + str(e))
    def FunDCT_GET_TEMPLATE_TYPE_DETAILS(self,iTemplateID):
        oTemplateTypeDetails = self.oPyDB.gen_template_types.find_one()

        pass

    def FunDCT_GET_HEADER_VALIDATION(self,iTemplateID,cParrent=False):
        try:
            oTemplateHeaderDetails = self.oPyDB.tmpl_metadatas.find({"iTemplateID":ObjectId(iTemplateID)},{'aTemplateHeader':1,'_id':0})
            newobj =  list(oTemplateHeaderDetails)
            if len(newobj) > 0:
                if newobj[0].get('aTemplateHeader'):
                    if cParrent:
                        tList = []
                        for oEach in newobj[0].get('aTemplateHeader'):
                            if oEach['cParentHeader'] == '':
                                tList.append(oEach)
                        return tList
                    else:

                        return newobj[0].get('aTemplateHeader')
            else:
                return list(oTemplateHeaderDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_GET_HEADER_VALIDATION  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GET_HEADER_VALIDATION  Error while parsing file due to ' + str(e))
    def FunDCT_GET_HEADER_VALIDATIONonlyChild(self,iTemplateID,):
        oTemplateHeaderDetails = self.oPyDB.tmpl_metadatas.find({"iTemplateID":ObjectId(iTemplateID)},{'aTemplateHeader':1,'_id':0})
        newobj =  list(oTemplateHeaderDetails)
        if len(newobj) > 0:
            if newobj[0].get('aTemplateHeader'):
                    tList = []
                    for oEach in newobj[0].get('aTemplateHeader'):
                        if oEach['cParentHeader'] != '':
                            tList.append(oEach)
                    return tList
        else:
            return list(oTemplateHeaderDetails)

    def FunDCT_ResetMappingColumnDetails(self,iTemplateID):
        try:
            self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                {"$unset": {"aMappedScacColumnsStat": "","tCuttoffdate":""}}
            )
        except Exception as e:
            LogService.log('Error : FunDCT_ResetMappingColumnDetails  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_ResetMappingColumnDetails  Error while parsing file due to ' + str(e))


    def FunDCT_UpdateMappingColumnDetails(self,iTemplateID, cMemberScac, aDeleteMemberRows, cLabel):
        try:
            self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                {"$unset": {cLabel + "." + cMemberScac: ""}}
            )

            oTemplateLogDetails = self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                {
                    "$push": {
                        cLabel + "." + cMemberScac: aDeleteMemberRows[cMemberScac],
                    }
                }
            )
            return list(oTemplateLogDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMappingColumnDetails  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMappingColumnDetails  Error while parsing file due to ' + str(e))


    def FunDCT_UpdateMemberCuttoff(self,iTemplateID, cMemberScac, aMemberCutoffs, cLabel):
        try:
            self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                {"$unset": {cLabel + "." + cMemberScac: ""}}
            )

            oTemplateLogDetails = self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                {
                    "$push": {
                        cLabel + "." + cMemberScac: aMemberCutoffs[cMemberScac],
                        # cLabel + "." + cMemberScac : "2021-05-24",
                    }
                }
            )
            return list(oTemplateLogDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberCuttoff  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberCuttoff  Error while parsing file due to ' + str(e))


    def FunDCT_UpdateLaneSubmission(self,iTemplateID, cMemberScacKey, cLabel, iSubmittedLanes):
        try:
            oTemplateLogDetails = self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID), "aMappedScacColumnsStat." +
                cMemberScacKey+".0."+cLabel+".iTotalLanes": {"$gt": 0}},
                # {"$inc":{"aMappedScacColumnsStat."+cMemberScacKey+".0."+cLabel+".iSubmittedLanes":iSubmittedLanes}} # To Increment use this
                {
                    "$set": {
                        "aMappedScacColumnsStat."+cMemberScacKey+".0."+cLabel+".iSubmittedLanes": iSubmittedLanes,
                    }
                }
            )

            return list(oTemplateLogDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateLaneSubmission  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateLaneSubmission  Error while parsing file due to ' + str(e))

    def FunDCT_AddLaneSubmission(self,iTemplateID, cMemberScacKey, cLabel, iSubmittedLanes):
        try:
            # oTemplateLogDetails = self.oPyDB.tmpl_metadatas.update(
            #     {"iTemplateID": ObjectId(iTemplateID)},
            #     {
            #         "$set":{
            #             "aMappedScacColumnsStat":{
            #                 cMemberScacKey:[{cLabel:{"iSubmittedLanes":iSubmittedLanes,"iTotalLanes":iSubmittedLanes}}]
            #             }
            #         }
            #      }
            # )
            oTemplateLogDetails = self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": ObjectId(iTemplateID)},
                # {"$inc":{"aMappedScacColumnsStat."+cMemberScacKey+".0."+cLabel+".iSubmittedLanes":iSubmittedLanes}} # To Increment use this
                {
                    "$set": {
                        "aMappedScacColumnsStat."+cMemberScacKey+".0."+cLabel+".iSubmittedLanes": iSubmittedLanes,
                        "aMappedScacColumnsStat."+cMemberScacKey+".0."+cLabel+".iTotalLanes": iSubmittedLanes,

                    }
                }
            )

            return list(oTemplateLogDetails)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateLaneSubmission  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateLaneSubmission  Error while parsing file due to ' + str(e))

    def FunDCT_GetUnMappednColumns(self,iTemplateID):
        try:
            oUnMappednColumns = self.oPyDB.tmpl_metadatas.aggregate(
                [{"$match": {   
                    "$and": [{"iTemplateID": ObjectId(iTemplateID)}]
                }},
                    {"$unwind": "$aTemplateHeader"},
                    {"$match": {
                    "$and": [{"iTemplateID": ObjectId(iTemplateID)}]
                    }}])
            return list(oUnMappednColumns)
        except Exception as e:
            LogService.log('Error : FunDCT_GetUnMappednColumns  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetUnMappednColumns  Error while parsing file due to ' + str(e))


    def FunDCT_GetMappednColumnTotalLanes(self,iTemplateID, cColumn):
        try:
            oUnMappednColumns = self.oPyDB.tmpl_metadatas.aggregate(
                [
                    {"$match": {
                        "$and": [{"iTemplateID": ObjectId(iTemplateID)}]
                    }},
                    {
                        "$project": {
                            "aMappedScacColumnsStat."+cColumn+".iTotalLanes": 1
                        }
                    },
                    {"$unwind": "$aMappedScacColumnsStat"},
                    {"$match": {
                    "$and": [{"iTemplateID": ObjectId(iTemplateID)}]
                    }},
                    {
                        "$project": {
                            "aMappedScacColumnsStat."+cColumn+".iTotalLanes": 1
                        }
                    },
                ])
            return list(oUnMappednColumns)
        except Exception as e:
            LogService.log('Error : FunDCT_GetMappednColumnTotalLanes  Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetMappednColumnTotalLanes  Error while parsing file due to ' + str(e))


    ##Function to modify pipeline according to table for getting aggregated data added by spirgonde start .
    # If in Future only the Records displayed on screen should be downloaded then $match can be used in this function.#
    def FuncDCT_EXportPipeLine(self,cType,companyName='DEFALT',userRole='',userID='',oSort= -1, templateTypeArray=[],valid_template_ids=[]):
        lPipeline = [
            {"$lookup": {"from": "gen_statuses", "localField": "iStatusID",
                        "foreignField": "_id", "as": "oStatus"}}, {"$unwind": "$oStatus"},
            {"$lookup": {"from": "gen_users", "localField": "iEnteredby",
                        "foreignField": "_id", "as": "oEnteredby"}}, {"$unwind": "$oEnteredby"},
            {"$lookup": {"from": "gen_users", "localField": "iUpdatedby",
                        "foreignField": "_id", "as": "oUpdatedby"}},
            {"$unwind": {
                "path": "$oUpdatedby",
                "preserveNullAndEmptyArrays": True
            }}
        ]

        lRegionPipe = [{"$lookup": {"from": "gen_regions", "localField": "iRegionID",
                                    "foreignField": "_id", "as": "oRegionListing"}}, {"$unwind": "$oRegionListing"}]

        lAccessTypePipe = [{"$lookup": {"from": "gen_accesstypes", "localField": "iAccessTypeID",
                                        "foreignField": "_id", "as": "oAccessTypeListing"}}, {"$unwind": "$oAccessTypeListing"}]

        lProcessPipe = [{"$lookup": {"from": "gen_processes", "localField": "iProcessID",
                                    "foreignField": "_id", "as": "oProcessListing"}}, {"$unwind": "$oProcessListing"}]
        
        lEmailTemplate = [{
                        "$lookup": {
                            "from": "gen_statuses",
                            "localField": "iStatusID",
                            "foreignField": "_id",
                            "as": "oStatus"
                        }
                    },
                    { "$unwind": "$oStatus" },
                    {
                        "$addFields": {
                            "iStatusID": "$oStatus.cStatusCode"  
                        }
                    },
             
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    { "$unwind": "$oProcessListing" }
                ]

        lTemplateTypePipe = [{"$lookup": {"from": "gen_template_types", "localField": "cTemplateType",
                                        "foreignField": "_id", "as": "oTemplateTypeListing"}}]
        lMemberListTemplate = [
                    {"$match": {"_id": {"$in": valid_template_ids}}},
                    {"$match": {"cTemplateType": {"$in": templateTypeArray}}},
                    { "$lookup": {"from": "gen_statuses", "localField": "iStatusID", "foreignField": "_id", "as": "oTemplateListing"} },
                    { "$unwind": "$oTemplateListing" },
                    {
                    "$lookup": {
                    "from": "tmpl_metadatas",
                    "localField": "_id",
                    "foreignField": "iTemplateID",
                    "as": "oMetadatas",
                    },
                    },
                    {
                        "$match" : {
                            "oMetadatas":{
                                "$elemMatch":{
                                    "aMemberCutoffs."+ companyName :{
                                        "$elemMatch":{"$ne" : ""}
                                    }
                                }
                            }
                        }
                        
                    },
                    {
                        "$project": {
                        "_id": 1,
                        "cTemplateName": 1,
                        "cTemplateType": 1,
                        "iTempActiveStatus": 1,
                        "cTemplateSampleFile": 1,
                        "iStatusID": 1,
                        "iEnteredby": 1,
                        "tEntered": 1,
                        "iUpdatedby": 1,
                        "oTemplateListing": 1,
                        "tUpdated": 1,
                        "iTemplateCounter": 1,
                        "oStatus": 1,
                        "oEnteredby": 1,
                        "oUpdatedby": 1,
                        "tCuttoffdate": { "$arrayElemAt": ["$oMetadatas.tCuttoffdate", 0] }
                        }
                    }
                ]
        
        lAdminListTemplate = [
                    {"$match": {"_id": {"$in": valid_template_ids}}},
                    {"$match": {"cTemplateType": {"$in": templateTypeArray}}},
                    { "$lookup": {"from": "gen_statuses", "localField": "iStatusID", "foreignField": "_id", "as": "oTemplateListing"} },
                    { "$unwind": "$oTemplateListing" },
                    { "$lookup": {"from": "tmpl_metadatas", "localField": "_id", "foreignField": "iTemplateID", "as": "oTemplateMetaDataListing"} },
                    { "$unwind": "$oTemplateMetaDataListing" },
                    {
                        "$project": {
                            "_id": 1,
                            "cTemplateName": 1,
                            "cTemplateType": 1,
                            "iTempActiveStatus": 1,
                            "cTemplateSampleFile": 1,
                            "iStatusID": 1,
                            "iEnteredby": 1,
                            "tEntered": 1,
                            "iUpdatedby": 1,
                            "oTemplateListing": 1,
                            "tUpdated": 1,
                            "iTemplateCounter": 1,
                            "oStatus": 1,
                            "oEnteredby": 1,
                            "oUpdatedby": 1,
                            "oTemplateMetaDataListing.tCuttoffdate": 1,
                            "tCuttoffdate" : "$oTemplateMetaDataListing.tCuttoffdate",
                        }
                    },
                    { "$skip": 0 },
                ]
        
        lTempTypeFilterPipe = [
                    {
                        "$lookup": {
                        "from": "gen_statuses",
                        "localField": "iStatusID",
                        "foreignField": "_id",
                        "as": "oTemplateUploadLogListing"
                        },
                    },
                    { "$unwind": "$oTemplateUploadLogListing" },
                    {
                        "$lookup": {
                        "from": "gen_templates",
                        "localField": "iTemplateID",
                        "foreignField": "_id",
                        "as": "templateDetails",
                        },
                    },
                    { "$unwind": "$templateDetails" },
                    {
                        "$match": {
                        "templateDetails.cTemplateType": { "$in": templateTypeArray },
                        },
                    },
                    
                    {
                        "$match": {
                        "templateDetails.iTempActiveStatus": 0,
                        },
                    }]

        if cType == 'USER':
            lPipeline.extend(lAccessTypePipe)
            lPipeline.extend(lTemplateTypePipe)

        elif cType == 'VALIDATION_RULE' or cType=='CUSTOMER':
            # lUserPipeline = [{"$lookup": {"from": "gen_template_types", "localField": "cTemplateType",
            #                               "foreignField": "_id", "as": "oTemplateTypeListing"}}]
            lPipeline.extend(lTemplateTypePipe)

        elif cType == 'MEMBER':
            lPipeline.extend(lTemplateTypePipe)
        elif cType == 'TEMPLATE_UPLOAD_LOG':
                lTempUploadFilterPipe = [
                    {
                        "$match": { 
                            "iActiveStatus": 0 
                        }
                    },
                    {
                        "$lookup": {
                        "from": "gen_statuses",
                        "localField": "iStatusID",
                        "foreignField": "_id",
                        "as": "oTemplateUploadLogListing"
                        },
                    },
                    { "$unwind": "$oTemplateUploadLogListing" },
                    {
                        "$lookup": {
                        "from": "gen_templates",
                        "localField": "iTemplateID",
                        "foreignField": "_id",
                        "as": "templateDetails",
                        },
                    },
                    { "$unwind": "$templateDetails" },
                    {
                        "$match": {
                        "templateDetails.cTemplateType": { "$in": templateTypeArray },
                        },
                    },
                    
                    {
                        "$match": {
                        "templateDetails.iTempActiveStatus": 0,
                        },
                    }]
                 
                lPipeline.extend(lTempUploadFilterPipe)

        elif cType == 'MEMBER_UPLOAD_LOG':
            if str(userRole).lower() == 'member':
                lMemberPipeline = [
                    {
                        "$match": { 
                            "iActiveStatus": 0 
                        }
                    },
                    {
                        "$lookup": {
                        "from": "gen_statuses",
                        "localField": "iStatusID",
                        "foreignField": "_id",
                        "as": "oMemberUploadLogListing",
                        },
                    },
                    {"$unwind": "$oMemberUploadLogListing"}, 
                    {
                        "$lookup": {
                        "from": "gen_templates",
                        "localField": "iTemplateID",
                        "foreignField": "_id",
                        "as": "templateDetails",
                        },
                    },
                    { "$unwind": "$templateDetails" },
                    {
                        "$match": {
                        "templateDetails.cTemplateType": { "$in": templateTypeArray },
                        },
                    },
                    {"$match": {
                            "templateDetails.iTempActiveStatus":{"$eq":0},
                            "cScacCode": {"$eq":companyName}
                    }},
                ]
                lPipeline.extend(lMemberPipeline)
            else:
                lAdminPipeline = [
                    {
                        "$match": { 
                            "iActiveStatus": 0 
                        }
                    },
                    {
                        "$lookup": {
                        "from": "gen_statuses",
                        "localField": "iStatusID",
                        "foreignField": "_id",
                        "as": "oMemberUploadLogListing",
                        },
                    },
                    {"$unwind": "$oMemberUploadLogListing"}, 
                    {
                        "$lookup": {
                        "from": "gen_templates",
                        "localField": "iTemplateID",
                        "foreignField": "_id",
                        "as": "templateDetails",
                        },
                    },
                    { "$unwind": "$templateDetails" },
                    {
                        "$match": {
                        "templateDetails.cTemplateType": { "$in": templateTypeArray },
                        },
                    },
                    
                    {
                        "$match": {
                        "templateDetails.iTempActiveStatus": 0,
                        },
                    },
                ]
                lPipeline.extend(lAdminPipeline)
            
        elif cType == 'LIST_TEMPLATE':
            if str(userRole).lower() == 'member':
                lPipeline.extend(lMemberListTemplate)
            else:
                lPipeline.extend(lAdminListTemplate)
        
        elif cType == 'EMAIL_TEMPLATES':
            lPipeline.extend(lEmailTemplate)

        elif cType == 'PERMISSION':
            lPipeline.extend(lProcessPipe)
            lPipeline.extend(lAccessTypePipe)
        elif cType == 'TEMPLATE_TYPE':
            if str(userRole).lower() == 'member':
                lPipeline = [
                    {
                        "$lookup": {
                            "from": "gen_users",
                            "localField": "_id",
                            "foreignField": "cTemplateType",
                            "as": "userTemplates"
                        }
                    },
                    {
                        "$match": {
                            "userTemplates": {"$ne": []},  
                            "userTemplates._id": ObjectId(userID)
                        }
                    },
                    {
                        "$lookup": {
                            "from": "gen_statuses",
                            "localField": "iStatusID",
                            "foreignField": "_id",
                            "as": "oStatus"
                        }
                    },
                    {
                        "$unwind": "$oStatus"
                    },
                    {
                        "$addFields": {
                            "iStatusID": "$oStatus.cStatusCode"
                        }
                    }
                ]
            else:
                lPipeline = [
                    {
                        "$lookup": {
                            "from": "gen_statuses",
                            "localField": "iStatusID",
                            "foreignField": "_id",
                            "as": "oStatus"
                        }
                    },
                    {
                        "$unwind": "$oStatus"
                    },
                    {
                        "$addFields": {
                            "iStatusID": "$oStatus.cStatusCode"
                        }
                    }
                ]
        elif cType == 'COUNTRY':
            lPipeline.extend(lRegionPipe)
        elif cType == 'EMAIL_FREQUENCY':
            lPipeline.extend(lProcessPipe)
        
        elif cType == 'CONSOLIDATE':
            lPipeline.extend(lTempTypeFilterPipe)
        
        elif cType == 'MEMBER_SUBMISSION_TEMPLATE_LOGS':
            lPipeline.extend(lTempTypeFilterPipe)

        elif cType == 'STATUS':
            lPipeline.clear()
            lPipeline = [
                {"$lookup": {"from": "gen_users", "localField": "iEnteredby",
                            "foreignField": "_id", "as": "oEnteredby"}}, {"$unwind": "$oEnteredby"},
                {"$lookup": {"from": "gen_users", "localField": "iUpdatedby",
                            "foreignField": "_id", "as": "oUpdatedby"}},
                {"$unwind": {
                    "path": "$oUpdatedby",
                    "preserveNullAndEmptyArrays": True
                }}
            ]
        elif cType == 'MEMBER_TEMPLATE_LIST':
            lPipeline.extend(lMemberListTemplate)
        lPipeline.extend([
            {"$sort": oSort if oSort != -1 else {"tEntered": -1}  }
        ])
        
        return lPipeline

    def get_user_template_type_details(self, userID):
        current_user_id = ObjectId(userID) 

        pipeline = [
            {"$match": {"_id": current_user_id}},  
            {"$project": {"cTemplateType": 1}}, 
            {
                "$lookup": {
                    "from": "gen_template_types",  
                    "let": {"templateType": "$cTemplateType"}, 
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$in": [
                                        {"$toObjectId": "$_id"}, 
                                        "$$templateType" 
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "templateDetails"
                }
            },
            {"$project": {"cTemplateType": 1, "templateDetails": 1}} 
        ]

        result = list(self.oPyDB.gen_users.aggregate(pipeline))

        if result:
            user = result[0]
            template_details = user.get("templateDetails", [])
            if template_details:
                cTemplateNames = [item.get("cTemplateType", None) for item in template_details]
                return cTemplateNames
        else:
            return []

    def FunDCT_ExportListing(self,cType,cSearchFilterQuery,companyName='',userRole= '',userID='',oSort= -1,templateTypeArray=[], valid_template_ids=[]):
        try:
            pipeline = self.FuncDCT_EXportPipeLine(cType,companyName,userRole,userID,oSort,templateTypeArray,valid_template_ids)
            search_filter = json.loads(cSearchFilterQuery)
            pipeline.append(search_filter)

            if cType == 'MESSAGE':
                oGetMessages = self.oPyDB.gen_messages.aggregate(pipeline)
                return list(oGetMessages)
            elif cType == 'STATUS':
                oGetStatues = self.oPyDB.gen_statuses.aggregate(pipeline)
                return list(oGetStatues)
            elif cType == 'PERMISSION':
                oGetPermissions = self.oPyDB.gen_permissions.aggregate(
                    pipeline)
                return list(oGetPermissions)
            elif cType == 'PROCESS':
                oGetProcesses = self.oPyDB.gen_processes.aggregate(
                    pipeline)
                return list(oGetProcesses)
            elif cType == 'ADDITIONAL_FIELDS':
                oGetAdditionalfields = self.oPyDB.gen_additionalfields.aggregate(
                    pipeline)
                return list(oGetAdditionalfields)
            elif cType == 'EMAIL_TEMPLATES':
                oGetEmailtemplates = self.oPyDB.gen_emailtemplates.aggregate(
                    pipeline)
                return list(oGetEmailtemplates)
            elif cType == 'COUNTRY':
                oGetCountries = self.oPyDB.gen_countries.aggregate(
                    pipeline)
                return list(oGetCountries)
            elif cType == 'MEMBER':
                oGetMembers = self.oPyDB.gen_members.aggregate(pipeline)
                return list(oGetMembers)
            elif cType == 'REGION':
                oGetRegions = self.oPyDB.gen_regions.aggregate(pipeline)
                return list(oGetRegions)
            elif cType == 'CURRENCY':
                oGetCurrencies = self.oPyDB.gen_currencies.aggregate(
                    pipeline)
                return list(oGetCurrencies)
            elif cType == 'CHARGECODE':
                oGetChargecodes = self.oPyDB.gen_chargecodes.aggregate(
                    pipeline)
                return list(oGetChargecodes)
            elif cType == 'RATE_BASIS':
                oGetBasises = self.oPyDB.gen_basises.aggregate(pipeline)
                return list(oGetBasises)
            elif cType == 'ACCESS_TYPE':
                oGetAccesstypes = self.oPyDB.gen_accesstypes.aggregate(
                    pipeline)
                return list(oGetAccesstypes)
            elif cType == 'VALIDATION_RULE':
                oGetValidationRules = self.oPyDB.gen_templatevalidations.aggregate(
                    pipeline)
                return list(oGetValidationRules)
            elif cType == 'USER':
                oGetUsers = self.oPyDB.gen_users.aggregate(pipeline)
                return list(oGetUsers)
            elif cType == 'LOCATIONS':
                oGetLocations = self.oPyDB.gen_locations.aggregate(
                    pipeline)
                return list(oGetLocations)
            # code added by spirgonde for download button task start
            elif cType == 'LIST_TEMPLATE':
                oGetTemplates = self.oPyDB.gen_templates.aggregate(
                    pipeline)
                return list(oGetTemplates)
            elif cType == 'MEMBER_TEMPLATE_LIST':
                oGetMemberTemplates = self.oPyDB.gen_templates.aggregate(
                    pipeline)
                return list(oGetMemberTemplates)
            elif cType == 'TEMPLATE_UPLOAD_LOG':
                oGetTemplateUploadLogs = self.oPyDB.tmpl_uploadlogs.aggregate(
                    pipeline)
                return list(oGetTemplateUploadLogs)
            elif cType == 'MEMBER_UPLOAD_LOG':
                oGetMemberUploadLogs = self.oPyDB.mem_uploadlogs.aggregate(
                    pipeline)
                return list(oGetMemberUploadLogs)
            elif cType == 'EMAIL_FREQUENCY':
                oGetEmailFrequencies = self.oPyDB.tmpl_reminderemailfreqs.aggregate(
                    pipeline)
                return list(oGetEmailFrequencies)
            elif cType == 'CUSTOMER':
                oGetCustomers = self.oPyDB.gen_customers.aggregate(
                    pipeline)
                return list(oGetCustomers)
            elif cType == 'MEMBER_RESTRICTION':
                oGetMemberRestriction = self.oPyDB.tmpl_memberrestrictions.aggregate(
                    pipeline)
                return list(oGetMemberRestriction)

            elif cType == 'TEMPLATE_TYPE':
                oGetTemplateTypes = self.oPyDB.gen_template_types.aggregate(
                    pipeline)
                return list(oGetTemplateTypes)

            elif cType == 'CARRIER':
                oGetCarriers = self.oPyDB.gen_carriers.aggregate(
                    pipeline)
                return list(oGetCarriers)
            
            elif cType == 'CONSOLIDATE':
                oConsolidateRequest = self.oPyDB.tmpl_consolidationreqs.aggregate(
                    pipeline)
                return list(oConsolidateRequest)
            
            elif cType == 'MEMBER_SUBMISSION_TEMPLATE_LOGS':
                oMemberSubmissionRequest = self.oPyDB.tmpl_membersubmissiondownloadlogs.aggregate(
                    pipeline)
                return list(oMemberSubmissionRequest)
            # code added by spirgonde for download button task end

            return []
        except Exception as e:
            # print(e)
            LogService.log('Error : FunDCT_ExportListing Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_ExportListing Error while parsing file due to ' + str(e))


    def FunDCT_InsertTemplateLog(self,cCollection, iTemplateUploadLogID, cUploadedFile, cField,cExceptionDetails=''):
        try:
            if cCollection == 'tmpl_uploadlogs':
                if cField == 'cUploadedFile':
                    self.oPyDB.tmpl_uploadlogs.find_one_and_update({'_id': ObjectId(
                        iTemplateUploadLogID)}, {'$set': {'cUploadedFile': cUploadedFile, 'cExceptionDetails':cExceptionDetails}}, new=True)
                elif cField == 'cTemplateStatusUploadedFile':
                    self.oPyDB.tmpl_uploadlogs.find_one_and_update({'_id': ObjectId(
                        iTemplateUploadLogID)}, {'$set': {'cTemplateStatusUploadedFile': cUploadedFile}}, new=True)
                    oTemplateDataDetails = self.oPyDB.tmpl_uploadlogs.find(
                        {'_id': ObjectId(iTemplateUploadLogID)})
                    iTemplateID = oTemplateDataDetails[0]['iTemplateID']
                    self.oPyDB.tmpl_metadatas.find_one_and_update({'iTemplateID': ObjectId(
                        iTemplateID)}, {'$set': {'aDistributedData': cUploadedFile}}, new=True)
            elif cCollection == 'mem_uploadlogs':
                if cField == 'cUploadedFile':
                    self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                        iTemplateUploadLogID)}, {'$set': {'cUploadedFile': cUploadedFile,  'cExceptionDetails':cExceptionDetails}}, new=True)
                elif cField == 'cTemplateStatusUploadedFile':
                    self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                        iTemplateUploadLogID)}, {'$set': {'cTemplateStatusUploadedFile': cUploadedFile}}, new=True)
            elif cCollection == 'gen_templates':
                self.oPyDB.gen_templates.find_one_and_update({'_id': ObjectId(
                    iTemplateUploadLogID)}, {'$set': {'cUploadedFile': cUploadedFile}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))


    def FunDCT_GetTemplateLog(self,cCollection, iTemplateUploadLogID):
        try:
            if cCollection == 'tmpl_uploadlogs':
                oGetTemplateLog = self.oPyDB.tmpl_uploadlogs.find(
                    {'_id': ObjectId(iTemplateUploadLogID)}, {'cUploadedFile': 1, '_id': 0})
            elif cCollection == 'mem_uploadlogs':
                oGetTemplateLog = self.oPyDB.mem_uploadlogs.find(
                    {'_id': ObjectId(iTemplateUploadLogID)}, {'cUploadedFile': 1, '_id': 0})
            elif cCollection == 'gen_templates':
                oGetTemplateLog = self.oPyDB.gen_templates.find({'_id': ObjectId(
                    iTemplateUploadLogID)}, {'cUploadedFile': 1, 'cTemplateType': 1, 'cTemplateSampleFile':1, '_id': 0})

            return list(oGetTemplateLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetTemplateLog Error while parsing file due to ' + str(e))
    def FunDCT_GetTemplateUplodedFile(self,cCollection, iTemplateUploadLogID):
        try:
            if cCollection == 'tmpl_uploadlogs':
                oGetTemplateLog = self.oPyDB.tmpl_uploadlogs.aggregate(
                    [{
                        '$match': {
                            'iTemplateID':ObjectId(iTemplateUploadLogID)
                        }
                        },{
                        '$sort': {
                            '_id': -1
                        }
                        },{
                        '$limit': 1
                        },{
                        '$project': {
                            '_id':0,
                            'cTemplateFile':1
                        }
                        }]
                )
            elif cCollection == 'mem_uploadlogs':
                oGetTemplateLog = self.oPyDB.mem_uploadlogs.aggregate(
                                    [{
                        '$match': {
                            'iTemplateID':ObjectId(iTemplateUploadLogID)
                        }
                        },{
                        '$sort': {
                            '_id': -1
                        }
                        },{
                        '$limit': 1
                        },{
                        '$project': {
                            '_id':0,
                            'cTemplateFile':1
                        }
                        }]
                )
                
            return list(oGetTemplateLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetTemplateLog Error while parsing file due to ' + str(e))


    def FunDCT_GetConsolidationData(self,iTemplateID):
        try:
            oConsolidationTemplateLog = self.oPyDB.tmpl_metadatas.find(
                {'iTemplateID': ObjectId(iTemplateID)}, {'aConsolidationData': 1, '_id': 0})
            return list(oConsolidationTemplateLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetConsolidationData Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetConsolidationData Error while parsing file due to ' + str(e))


    def FunDCT_GetDistributionData(self,iTemplateID):
        try:
            oConsolidationTemplateLog = self.oPyDB.tmpl_metadatas.find(
                {'iTemplateID': ObjectId(iTemplateID)}, {'aDistributedData': 1, '_id': 0})
            return list(oConsolidationTemplateLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetDistributionData Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetDistributionData Error while parsing file due to ' + str(e))


    def FunDCT_GetRestrictedMembers(self,cTemplateType, cType):
        try:
            oGetActiveStatus = self.statusActive
            cActiveStatusID = oGetActiveStatus[0]['_id']
            oGetMember = self.oPyDB.tmpl_memberrestrictions.find(
                {'iStatusID': cActiveStatusID, 'cTemplateType': cTemplateType, 'cType': cType})
            return list(oGetMember)
        except Exception as e:
            LogService.log('Error : FunDCT_GetRestrictedMembers Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetRestrictedMembers Error while parsing file due to ' + str(e))


    def FunDCT_UpdateExceptionFlag(self,iTemplateUploadLogID, bExceptionfound):
        try:
            self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bExceptionfound': bExceptionfound}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
    def FunDCT_UpdateEndprocessingAndProcesslock(self,iTemplateUploadLogID, tProcessEnd=None,bProcesslock='N'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessEnd':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))

    def FunDCT_UpdateSuccessErrorFilePath(self,iTemplateUploadLogID, successFilePath,errorFilePath):
        try:
            if len(successFilePath) > 0:
                self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                    iTemplateUploadLogID)}, {'$set': {'successFilePath': successFilePath}}, new=True)
            if len(errorFilePath):
                self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                    iTemplateUploadLogID)}, {'$set': {'errorFilePath': errorFilePath}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_InsertTemplateLog Error while parsing file due to ' + str(e))
    def FunDCT_GetSCACHeadersIndex(self, oValidation):
        tList = []
        i = 1 
        for oVal in oValidation:
            oValC = oVal['cValidations']
            if 'DEFAULT_ORIGIN_SCAC' in oValC:
                tList.append(i)
            if 'DEFAULT_DESTINATION_SCAC' in oValC:
                tList.append(i)
            if 'DEFAULT_OCEAN_SCAC' in oValC:
                tList.append(i)
            if 'DEFAULT_SCAC' in oValC:
                tList.append(i)
            i+=1
        return tList

    def getTemplateName(self,listr):
        lTmplist = []
        for r in listr:
            row = self.oPyDB.gen_template_types.find({'_id':r},{'cTemplateType':1,'_id':0})
            lr = list(row)
            lTmplist.append(lr[0]['cTemplateType'])
        return lTmplist
    def getUnmappedDetails(self,id):
        data = self.oPyDB.tmpl_metadatas.find({'iTemplateID':ObjectId(id)},{'aUnMappedColumns':1,'_id':0})
        return list(data)
    
    def get_valid_template_ids(self):
        valid_templates = list(self.oPyDB.gen_templates.find(
            {'iTempActiveStatus': 0},  
            {'_id': 1} 
        ))
        return [template['_id'] for template in valid_templates]
    def get_LaneTodo(self):
        lanes = list(self.oPyDB.gen_lanes.find(
            {'iToDo': {'$gt': 0}} 
        ))
        return lanes
    def get_LaneScheduleById(self, _id):
        try:
            lanes = list(self.oPyDB.gen_laneschedules.find(
                {'_id': {'$eq': ObjectId(_id)}} 
            ).limit(1))
            return lanes[0]
        except:
            return None
    def get_LaneSchedule(self,iTemplateID):
        try:
            lanes = list(self.oPyDB.gen_laneschedules.find(
                {'iTemplateTypeID': {'$eq': ObjectId(iTemplateID)}} 
            ).limit(1))
            if len(lanes) >= 1:
                return lanes[0]
            return lanes
        except:
            return None
    def delete_LaneSchedulebyID(self,id):
        result = self.oPyDB.gen_laneschedules.delete_one(
            {'_id': ObjectId(id)})
    def update_LaneIncremental(self,lid):
        update_operation = {
            "$inc": {"iActive": 1}  # Increment iActive by 1
        }

        # Perform the update operation
        result = self.oPyDB.gen_lanes.update_one(
            {"_id": ObjectId(lid)},  # Find document by its _id
            update_operation  # Perform the increment update
        )
    def update_LaneDecremental(self,lid):
        update_operation = {
            "$inc": {"iActive": -1,"iToDo":-1}  # decremtn iActive by -1
        }
        result = self.oPyDB.gen_lanes.update_one(
            {"_id": ObjectId(lid)}, 
            update_operation  # Perform the increment update
        )

    def FunDCT_UpdateTemplateStartprocessingAndProcesslock(self,iTemplateUploadLogID, tProcessStart=None,bProcesslock='Y'):
        try:
            if tProcessStart is None: tProcessStart = datetime.now()
            self.oPyDB.tmpl_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessStart':tProcessStart}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
        
    def FunDCT_UpdateTemplateEndprocessingAndProcesslock(self,iTemplateUploadLogID, tProcessEnd=None,bProcesslock='N'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.tmpl_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessEnd':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateTemplateEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateTemplateEndprocessingAndProcesslock Error while parsing file due to ' + str(e))


    def FunDCT_UpdateMemberStartprocessingAndProcesslock(self,iTemplateUploadLogID, tProcessStart=None,bProcesslock='Y'):
        try:
            if tProcessStart is None: tProcessStart = datetime.now()
            self.oPyDB.mem_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessStart':tProcessStart}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberStartprocessingAndProcesslock Error while parsing file due to ' + str(e))  

    def FunDCT_UpdateUploadlogExceptionfoundAndProcessed(self,iTemplateUploadLogID,bExceptionfound,bProcessed):
        try:
            self.oPyDB.tmpl_uploadlogs.find_one_and_update({'_id': ObjectId(
                iTemplateUploadLogID)}, {'$set': {'bExceptionfound':bExceptionfound, 'bProcessed': bProcessed}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateUploadlogExceptionfoundAndProcessed Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateUploadlogExceptionfoundAndProcessed Error while parsing file due to ' + str(e))  

                
    # def FunDCT_UpdateConsolidateTemplateStartprocessingAndProcesslock(self,_iTemplateConsolidationReqID, tProcessStart=None,bProcesslock='Y'):
    #     try:
    #         if tProcessStart is None: tProcessStart = datetime.now()
    #         self.oPyDB.tmpl_consolidationreqs.find_one_and_update({'_id': ObjectId(
    #             _iTemplateConsolidationReqID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessStart':tProcessStart}}, new=True)
    #     except Exception as e:
    #         LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
    #         return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            

    def FunDCT_UpdateConsolidateTemplateEndprocessingAndProcesslock(self,_iTemplateConsolidationReqID, tProcessEnd=None,bProcesslock='N',bProcessed= 'Y'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.tmpl_consolidationreqs.find_one_and_update({'_id': ObjectId(
                _iTemplateConsolidationReqID)}, {'$set': {'bProcessed':bProcessed,'bProcesslock': bProcesslock,'tProcessEnd':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartprocessingAndProcesslock Error while parsing file due to ' + str(e))


    def FunDCT_UpdateConsolidationReqsExceptionfoundAndProcessed(self,_iTemplateConsolidationReqID,tProcessEnd=None,bExceptionfound='Y',bProcessed='F',bProcesslock= 'N'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.tmpl_consolidationreqs.find_one_and_update({'_id': ObjectId(
                _iTemplateConsolidationReqID)}, {'$set': {'bExceptionfound':bExceptionfound, 'bProcessed': bProcessed ,'bProcesslock':bProcesslock, 'tProcessEnd':tProcessEnd , 'tUpdated':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateConsolidationReqsExceptionfoundAndProcessed Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidationReqsExceptionfoundAndProcessed Error while parsing file due to ' + str(e)) 




    def FunDCT_UpdateMemberSubmissionlogsStartprocessingAndProcesslock(self,_iTemplateMemberSubmissionID, tProcessStart=None,bProcesslock='Y'):
        try:
            if tProcessStart is None: tProcessStart = datetime.now()
            self.oPyDB.tmpl_membersubmissiondownloadlogs.find_one_and_update({'_id': ObjectId(
                _iTemplateMemberSubmissionID)}, {'$set': {'bProcesslock': bProcesslock,'tProcessStart':tProcessStart , 'tUpdated':tProcessStart}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberSubmissionlogsStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberSubmissionlogsStartprocessingAndProcesslock Error while parsing file due to ' + str(e))
            

    def FunDCT_UpdateMemberSubmissionlogsEndprocessingAndProcesslock(self,_iTemplateMemberSubmissionID, tProcessEnd=None,bProcesslock='N',bProcessed= 'Y'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.tmpl_membersubmissiondownloadlogs.find_one_and_update({'_id': ObjectId(
                _iTemplateMemberSubmissionID)}, {'$set': {'bProcessed':bProcessed,'bProcesslock': bProcesslock,'tProcessEnd':tProcessEnd , 'tUpdated':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberSubmissionlogsEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberSubmissionlogsEndprocessingAndProcesslock Error while parsing file due to ' + str(e))


    def FunDCT_UpdateMemberSubmissionlogsExceptionfoundAndProcessed(self,_iTemplateMemberSubmissionID,tProcessEnd=None,bProcessed='F',bProcesslock= 'N'):
        try:
            if tProcessEnd is None: tProcessEnd = datetime.now()
            self.oPyDB.tmpl_membersubmissiondownloadlogs.find_one_and_update({'_id': ObjectId(
                _iTemplateMemberSubmissionID)}, {'$set': {'bProcessed': bProcessed ,'bProcesslock':bProcesslock, 'tProcessEnd':tProcessEnd , 'tUpdated':tProcessEnd}}, new=True)
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberSubmissionlogsExceptionfoundAndProcessed Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberSubmissionlogsExceptionfoundAndProcessed Error while parsing file due to ' + str(e))


    def getTmplConsolidationReqDetails(self,iStatusID, id):
            try:
                return self.oPyDB.tmpl_consolidationreqs.find_one({'iStatusID': iStatusID,'_id': ObjectId(id)})
            except Exception as e:
                LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
                return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e)) 



    def FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock(self,_iTemplateConsolidationReqID, aRequestDetails):
            try:
                self.oPyDB.tmpl_consolidationreqs.find_one_and_update({'_id': ObjectId(
                    _iTemplateConsolidationReqID)}, {'$set': aRequestDetails}, new=True)
            except Exception as e:
                LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
                return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
            

    def getTmplMembersubmissionReqDetails(self,iStatusID, id):
            try:
                return self.oPyDB.tmpl_membersubmissiondownloadlogs.find_one({'iStatusID': iStatusID,'_id': ObjectId(id)})
            except Exception as e:
                LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
                return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e)) 


    def FunDCT_UpdateMemberSubmissionStartOrEndprocessingAndProcesslock(self,_iTemplateMemberSubmissionID, aRequestDetails):
            try:
                self.oPyDB.tmpl_membersubmissiondownloadlogs.find_one_and_update({'_id': ObjectId(
                    _iTemplateMemberSubmissionID)}, {'$set': aRequestDetails}, new=True)
            except Exception as e:
                LogService.log('Error : FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
                return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateConsolidateTemplateStartOrEndprocessingAndProcesslock Error while parsing file due to ' + str(e))
            

    def FunDCT_GetTemplateDetails(self,iTemplateID):
        try:
            oTemplateDetails = list(self.oPyDB.gen_templates.aggregate([
                {"$match": {"_id": ObjectId(iTemplateID)}},  
                {
                    "$lookup": {
                        "from": "gen_statuses",
                        "localField": "iStatusID",
                        "foreignField": "_id",
                        "as": "oTemplateListing"
                    }
                },
                {"$unwind": "$oTemplateListing"},
                {
                    "$lookup": {
                        "from": "tmpl_metadatas",
                        "localField": "_id",
                        "foreignField": "iTemplateID",
                        "as": "oTemplateMetaDataListing"
                    }
                },
                {"$unwind": "$oTemplateMetaDataListing"}
            ]))

            return oTemplateDetails
        
        except Exception as err:
            LogService.log('Error : FunDCT_GetTemplateDetails ' + str(err))
            return None
        


    def FunDCT_findMetadataByTemplateID(self,iTemplateID):
        try:
            oTemplateMetaDetails = self.oPyDB.tmpl_metadatas.find_one({"iTemplateID": ObjectId(iTemplateID)})
            return oTemplateMetaDetails
        except Exception as err:
            LogService.log('Error : FunDCT_findMetadataByTemplateID ' + str(err))
            return None
        

    def FunDCT_UpdateDistributeTemplateUploadLog( self, bExceptionfound, aValidateResponse, cDirValidateTemplateStatusFile, aTmplUploadLogFields, _iTemplateUploadLogID ):
        try:
            oTmplUploadLog = self.oPyDB.tmpl_uploadlogs.find_one(
                {
                    "_id": ObjectId(_iTemplateUploadLogID), 
                    "iActiveStatus": 0
                }
            )
            if oTmplUploadLog:
                iTemplateID = oTmplUploadLog["iTemplateID"]
                cursor =  self.oPyDB.tmpl_uploadlogs.find(
                    {
                        "iTemplateID": iTemplateID,
                        "bExceptionfound": "N",
                        "bProcesslock": "N",
                        "bProcessed": "Y",
                        "iActiveStatus": 0,
                        "cExceptionDetails": "{}",
                    },
                    {
                        "iTemplateID": 1,
                        "cDistributionDetails": 1,
                        "cTemplateName": 1,
                    }
                ).sort("_id", -1)
                recordsList = list(cursor)

# Extract cDistributionDetails from recordsList
                existingDistributionDetails = {}
                for record in recordsList:
                    distributionDetails = record.get("cDistributionDetails", {})  # Get distribution details or empty dict
                    for key, value in distributionDetails.items():
                        existingDistributionDetails[value["cDistScaccode"]] = value  # Store by cDistScaccode

# Get new distribution details
                newDistributionDetails = aValidateResponse.get("cDistributionDetails", {})

# Compare and add unmatched records to existingDistributionDetails
                for key, newRecord in newDistributionDetails.items():
                    scacCode = newRecord["cDistScaccode"]
                    
# Add only if not found in existingDistributionDetails
                    if scacCode not in existingDistributionDetails:
                        existingDistributionDetails[scacCode] = newRecord

                aTmplUploadLogFields["cDistributionDetails"] = existingDistributionDetails
                oTemplateUploadLog = self.oPyDB.tmpl_uploadlogs.find_one_and_update(
                    {"_id": ObjectId(_iTemplateUploadLogID), "iActiveStatus": 0},
                    {"$set": aTmplUploadLogFields},
                    return_document=True
                )

            return oTemplateUploadLog
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateDistributeTemplateUploadLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateDistributeTemplateUploadLog Error while parsing file due to ' + str(e))
        

    def FunDCT_UpdateMemberTemplateUploadLog(self, bExceptionfound, aValidateResponse, cDirValidateTemplateStatusFile, aTmplUploadLogFields, _iTemplateUploadLogID ):
        try:
            oMemTmplUploadLog = self.oPyDB.mem_uploadlogs.find_one(
                {"_id": ObjectId(_iTemplateUploadLogID), "iActiveStatus": 0}
            )

            if oMemTmplUploadLog:
                isRateExtendMode = oMemTmplUploadLog.get('isRateExtendMode')

                oMemberTemplateUploadLog = self.oPyDB.mem_uploadlogs.find_one_and_update(
                    {"_id": oMemTmplUploadLog.get('_id'), "iActiveStatus": 0},
                    {"$set": aTmplUploadLogFields},
                    return_document=True  # Equivalent to `{ new: true }` in Mongoose
                )

            return oMemberTemplateUploadLog
        except Exception as e:
            LogService.log('Error : FunDCT_UpdateMemberTemplateUploadLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_UpdateMemberTemplateUploadLog Error while parsing file due to ' + str(e))
        

    def FunDCT_findByIDAndUpdateMetadata(self,metadataID, aRequestDetail):
        try:
            oTemplateMetaDetails = self.oPyDB.tmpl_metadatas.find_one_and_update(
                {"_id": metadataID},
                {"$set": aRequestDetail},
                return_document=True
            )
            return oTemplateMetaDetails
        except Exception as err:
            LogService.log('Error : FunDCT_findByIDAndUpdateMetadata ' + str(err))
            return None
        

    def FunDCT_SendSMTPNotification(self, cProcessCode, oEmailTemplateDetailList, aEmailVariablesVal, aVariablesVal, toEmail):
        try:
    # Add from email id set default.
            test_source_email = 'WWA <' + oEmailTemplateDetailList['cFrom'] + '>'
            
    # Add email 'Send To' set default.
            if isinstance(toEmail, str):
                toEmail = [toEmail]
            test_to_emails = list(dict.fromkeys(toEmail))
            # test_to_emails = toEmail

    # Add email bcc set default.
            test_bcc_emails = ['']

    # Add extra_cc_emails if available
            test_cc_emails = []
            test_cc_emails.append(oEmailTemplateDetailList['cFrom'])  # Add user's email to cc array
            
            if 'cBcc' in oEmailTemplateDetailList and oEmailTemplateDetailList['cBcc']:
                test_cc_emails.extend(oEmailTemplateDetailList['cBcc'].split(','))
            if 'extra_cc_emails' in aEmailVariablesVal and aEmailVariablesVal['extra_cc_emails']:
                test_cc_emails.extend(aEmailVariablesVal['extra_cc_emails'].split(','))
            test_cc_emails = list(dict.fromkeys(test_cc_emails)) # Remove duplicates while preserving order
                
    # Add subject if provided or set default.
            if 'extra_subject' in aEmailVariablesVal and aEmailVariablesVal['extra_subject']: 
                test_subject = aEmailVariablesVal['extra_subject']
            else:
                test_subject = oEmailTemplateDetailList['cSubject']

    # Add email body set default.
            if 'eEditedEmailBody' in aEmailVariablesVal and aEmailVariablesVal['eEditedEmailBody']: 
                test_body = aEmailVariablesVal['eEditedEmailBody']
            else:
                test_body = oEmailTemplateDetailList['cEmailBody']
            
    # Registering "DCTVARIABLE_ADDITIONALEMAILBODY" and "DCTVARIABLE_INSTRUCTIONFILE_CONTENT" || remove html tags from vars.
            # if 'DCTVARIABLE_ADDITIONALEMAILBODY' in aVariablesVal:
            #     aVariablesVal['DCTVARIABLE_ADDITIONALEMAILBODY'] = html.escape(aVariablesVal['DCTVARIABLE_ADDITIONALEMAILBODY'])
            # if 'DCTVARIABLE_INSTRUCTIONFILE_CONTENT' in aVariablesVal:
            #     aVariablesVal['DCTVARIABLE_INSTRUCTIONFILE_CONTENT'] = html.escape(aVariablesVal['DCTVARIABLE_INSTRUCTIONFILE_CONTENT'])

    # Set & render email body
            template = Template(test_body)
            test_body = template.render(aVariablesVal)

    # Call the sendTemplatedEmail function
            EmailService.sendTemplatedEmail(
                test_body,            # templateAsHTML
                "Test Trigger",       # trigger (added for consistency)
                test_subject,         # title
                test_source_email,    # user_email
                {},                   # metadata (empty dict for now)
                smtp_client,          # client (EmailSMTPClient instance)
                test_to_emails,
                test_cc_emails,
                test_bcc_emails,
                None                  # notification_email (optional)
            )
        
        except Exception as e:
            LogService.log('Error : FunDCT_SendSMTPNotification Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendSMTPNotification Error while parsing file due to ' + str(e))

    def FunDCT_SendDistributionDetails(self, aValidateResponse, oTemplateDetails, oResPyProg, cDirValidateTemplateStatusFile, oTemplateMetaData,oParams):
        try:
            ccEmailArray = []  # cc array
            sendToEmailArray = []  # sendTo array
            oEmailTemplateList = []
            selectedMember = ''
            cEmailSubject = ''

            cUsername = oParams["oRequestedByUserDetails"].get("cUsername", "")
            cEmail = oParams["oRequestedByUserDetails"].get("cEmail", "")
            _iTemplateUploadLogID = oParams['_iTemplateUploadLogID']
            sendToEmailArray.append(cEmail)  # Add user's email to cc array

            aVariablesVal = {
                "DCTVARIABLE_USERNAME": "User",
                "DCTVARIABLE_TEMPLATENAME": oTemplateDetails[0]["cTemplateName"],
                "DCTVARIABLE_ADDITIONALEMAILBODY": oTemplateMetaData["cEmailText"],
            }
            
            # Additional Email if exists
            if oTemplateMetaData.get("cAdditionalEmail") and oTemplateMetaData["cAdditionalEmail"] != "null":
                emailArray = [email.strip() for email in oTemplateMetaData["cAdditionalEmail"].split(",")]
                ccEmailArray.extend(emailArray)  # Add additional emails to cc array

            oTmplUploadLog = self.FunDCT_GetTemplateUploadLog(_iTemplateUploadLogID)
            if oTmplUploadLog[0]["iActiveStatus"] == -1:
                self.FunDCT_UpdateTemplateUploadLog(
                    _iTemplateUploadLogID, 
                    { "iActiveStatus": -1, "bExceptionfound": "Y", "bProcesslock": "N", "bProcessed": "F" }
                )
                self.FunDCT_updateMetadataByTemplateID(
                    oTmplUploadLog[0]["iTemplateID"], 
                    { "iRedistributedIsUploaded": "1" }
                )
                return
            if oTmplUploadLog:
                selectedMember = oTmplUploadLog[0].get("cSelectedMembers")
                
            if oTemplateMetaData.get("cEmailFrom") != "":
                ccEmailArray.append(oTemplateMetaData["cEmailFrom"])

            if oTemplateMetaData.get("cEmailSubject") != '':
                cEmailSubject = oTemplateMetaData["cEmailSubject"]
            
            
            if aValidateResponse.get("cDistributionDetails") and len(aValidateResponse["cDistributionDetails"]) > 0 and not aValidateResponse.get("iErrorLenth"):
                for cKey in aValidateResponse["cDistributionDetails"]:
                    cDistScaccode = aValidateResponse["cDistributionDetails"][cKey].get("cDistScaccode", "")
                    cMemberEmail = aValidateResponse["cDistributionDetails"][cKey].get("cMemberEmail", "")
                    
                    if selectedMember and len(selectedMember) > 0:
                        if cDistScaccode in selectedMember:
                            sendToEmailArray.append(cMemberEmail)
                    else:
                        sendToEmailArray.append(cMemberEmail)

            aEmailVariablesVal = {
                "extra_subject": cEmailSubject,
                "extra_to_emails": ",".join(sendToEmailArray),
                "extra_cc_emails": ",".join(ccEmailArray),
            }
            cQueryEmailFrom = {}
            cQueryProcessCode = []
            if oTemplateMetaData["cEmailTemplateID"]:
                cQueryEmailFrom = { "_id": ObjectId(oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailTemplateID"]) }
            else:
                cQueryEmailFrom = { "cFrom": oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailFrom"].strip() }
                cQueryProcessCode = { 
                    {"$unwind": "$oProcessListing.cProcessCode"},
                    {
                        "$match": {
                            "oProcessListing.cProcessCode": "UPLOAD_TEMPLATE"
                        }
                    } 
                }

            if oTemplateDetails[0]["oTemplateMetaDataListing"].get("cEmailFrom", "").strip():
                oEmailTemplateList = list(self.oPyDB.gen_emailtemplates.aggregate([
                    { "$match": cQueryEmailFrom },
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    {"$unwind": "$oProcessListing"},
                    *cQueryProcessCode
                ]))

            if oEmailTemplateList and len(oEmailTemplateList) > 0:
                oEmailTemplateDetailList = oEmailTemplateList[0]
                self.FunDCT_SendSMTPNotification(
                    "UPLOAD_TEMPLATE",
                    oEmailTemplateDetailList,
                    aEmailVariablesVal,
                    aVariablesVal,
                    sendToEmailArray
                )

        except Exception as e:
            LogService.log('Error : FunDCT_SendDistributionDetails Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendDistributionDetails Error while parsing file due to ' + str(e))

    def FunDCT_SendMemberUploadDetails(self, oUpdateUploadLog, aValidateResponse, oTemplateDetails, oResPyProg, cDirValidateTemplateStatusFile, oTemplateMetaData,oParams):
        try:
            member_email = ''
            ccEmailArray = []  # cc array
            sendToEmailArray = []  # sendTo array
            oEmailTemplateList = []
            cEmailSubject = ''

            bExceptionfound = 'Y' if aValidateResponse["iErrorLenth"] > 0 else 'N'
            cUsername = oParams["oRequestedByUserDetails"].get("cUsername", "")
            sCompanyname = oParams.get("_cCompanyname", "")
            cEmail = oParams["oRequestedByUserDetails"].get("cEmail", "")
            sCompanyDetails = self.FunDCT_GetEmailFromCompanyName(sCompanyname)
            _iTemplateUploadLogID = oParams['_iTemplateUploadLogID']
            sendToEmailArray.append(cEmail)  # Add user's email to cc array
            sendToEmailArray.append(sCompanyDetails)  # Add user's email to cc array
            cDistributionDetails = aValidateResponse.get("cDistributionDetails")
            if cDistributionDetails and len(cDistributionDetails) > 0:
                member_email = aValidateResponse["cDistributionDetails"][1].get("cMemberEmail", "")
                sendToEmailArray.append(member_email)  # Add user's email to cc array
                
            rate_extension = "Rates Extension" if oUpdateUploadLog.get("isRateExtendMode") == "true" else ""

            # cQueryEmailFrom = {}
            # cQueryProcessCode = []
            # if oTemplateMetaData["cEmailTemplateID"]:
            #     cQueryEmailFrom = { "_id": ObjectId(oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailTemplateID"]) }
            # else:
            cQueryEmailFrom = { "cFrom": oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailFrom"].strip() }
            cQueryProcessCode = [
                {"$unwind": "$oProcessListing.cProcessCode"},
                {
                    "$match": {
                        "oProcessListing.cProcessCode": "MEMBER_UPLOAD"
                    }
                }
            ]

            if oTemplateDetails[0]["oTemplateMetaDataListing"].get("cEmailFrom", "").strip():
                oEmailTemplateList = list(self.oPyDB.gen_emailtemplates.aggregate([
                    { "$match": cQueryEmailFrom },
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    {"$unwind": "$oProcessListing"},
                    *cQueryProcessCode
                ]))

            aVariablesVal = {
                "DCTVARIABLE_RATE_EXTENSION": rate_extension,
                "DCTVARIABLE_USERNAME": cUsername,
                "DCTVARIABLE_TEMPLATENAME": oTemplateDetails[0]["cTemplateName"],
                "DCTVARIABLE_STATUSFILE": FRONTEND_URI + "sessions/s3download?downloadpath=" + aValidateResponse["cStatusFilePath"],
                "DCTVARIABLE_EXCEPTION_FOUND": bExceptionfound
                # "DCTVARIABLE_ADDITIONALEMAILBODY": oTemplateMetaData["cEmailText"],
            }

            # if bExceptionfound == 'Y':
            #     aVariablesVal["DCTVARIABLE_EXCEPTION_FOUND"] = "Y"

            if isinstance(aValidateResponse.get('aValidateContent'), dict) and aValidateResponse['aValidateContent'] is not None:
                if len(aValidateResponse['aValidateContent'].keys()) > 0:
                    aVariablesVal['DCTVARIABLE_EXCEPTION_FOUND'] = 'Y'
                    cEmailSubject = f"Centric Errors in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
                else:
                    cEmailSubject = f"Centric Success in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
            
            if oEmailTemplateList[0].get('cEmailBody'):
                email_body = oEmailTemplateList[0]['cEmailBody']
                # exception_found = aVariablesVal.get('DCTVARIABLE_EXCEPTION_FOUND')

                if bExceptionfound == 'Y':
                    cEmailSubject = f"Centric Errors in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
                    eEditedEmailBody = re.sub(r'<!-- SUCCESSSTART -->[\s\S]*?<!-- SUCCESSEND -->', '', email_body)
                elif bExceptionfound == 'N':
                    cEmailSubject = f"Centric Success in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
                    eEditedEmailBody = re.sub(r'<!-- ERRORSTART -->[\s\S]*?<!-- ERROREND -->', '', email_body)
                else:
                    eEditedEmailBody = email_body
                    
            aEmailVariablesVal = {
                "extra_subject": cEmailSubject,
                "extra_to_emails": ",".join(sendToEmailArray),
                "extra_cc_emails": ",".join(ccEmailArray),
                "eEditedEmailBody": eEditedEmailBody
            }

            if oEmailTemplateList and len(oEmailTemplateList) > 0:
                oEmailTemplateDetailList = oEmailTemplateList[0]
                self.FunDCT_SendSMTPNotification(
                    "MEMBER_UPLOAD",
                    oEmailTemplateDetailList,
                    aEmailVariablesVal,
                    aVariablesVal,
                    sendToEmailArray
                )

        except Exception as e:
            LogService.log('Error : FunDCT_SendMemberUploadDetails Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendMemberUploadDetails Error while parsing file due to ' + str(e))

    def FunDCT_SendAdminMemberUploadDetails(self, oUpdateUploadLog, aValidateResponse, oTemplateDetails, oResPyProg, cDirValidateTemplateStatusFile, oTemplateMetaData,oParams):
        try:
            member_email = ''
            ccEmailArray = []  # cc array
            sendToEmailArray = []  # sendTo array
            oEmailTemplateList = []
            cEmailSubject = ''

            bExceptionfound = 'Y' if aValidateResponse["iErrorLenth"] > 0 else 'N'
            cUsername = oParams["oRequestedByUserDetails"].get("cUsername", "")
            cEmail = oParams["oRequestedByUserDetails"].get("cEmail", "")
            _iTemplateUploadLogID = oParams['_iTemplateUploadLogID']
            sendToEmailArray.append(cEmail)  # Add user's email to cc array
            cDistributionDetails = aValidateResponse.get("cDistributionDetails")
            if cDistributionDetails and len(cDistributionDetails) > 0:
                member_email = aValidateResponse["cDistributionDetails"][1].get("cMemberEmail", "")
                ccEmailArray.append(member_email)  # Add user's email to cc array
                
            rate_extension = "Rates Extension" if oUpdateUploadLog.get("isRateExtendMode") == "true" else ""

            # cQueryEmailFrom = {}
            # cQueryProcessCode = []
            # if oTemplateMetaData["cEmailTemplateID"]:
            #     cQueryEmailFrom = { "_id": ObjectId(oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailTemplateID"]) }
            # else:
            cQueryEmailFrom = { "cFrom": oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailFrom"].strip() }
            cQueryProcessCode = [
                {"$unwind": "$oProcessListing.cProcessCode"},
                {
                    "$match": {
                        "oProcessListing.cProcessCode": "MEMBER_UPLOAD"
                    }
                }
            ]

            if oTemplateDetails[0]["oTemplateMetaDataListing"].get("cEmailFrom", "").strip():
                oEmailTemplateList = list(self.oPyDB.gen_emailtemplates.aggregate([
                    { "$match": cQueryEmailFrom },
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    {"$unwind": "$oProcessListing"},
                    *cQueryProcessCode
                ]))

            aVariablesVal = {
                "DCTVARIABLE_RATE_EXTENSION": rate_extension,
                "DCTVARIABLE_USERNAME": cUsername,
                "DCTVARIABLE_TEMPLATENAME": oTemplateDetails[0]["cTemplateName"],
                "DCTVARIABLE_STATUSFILE": FRONTEND_URI + "sessions/s3download?downloadpath=" + aValidateResponse["cStatusFilePath"],
                "DCTVARIABLE_EXCEPTION_FOUND": bExceptionfound
                # "DCTVARIABLE_ADDITIONALEMAILBODY": oTemplateMetaData["cEmailText"],
            }

            # if bExceptionfound == 'Y':
            #     aVariablesVal["DCTVARIABLE_EXCEPTION_FOUND"] = "Y"

            if isinstance(aValidateResponse.get('aValidateContent'), dict) and aValidateResponse['aValidateContent'] is not None:
                if len(aValidateResponse['aValidateContent'].keys()) > 0:
                    aVariablesVal['DCTVARIABLE_EXCEPTION_FOUND'] = 'Y'
                    cEmailSubject = f"Centrix Errors in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
                else:
                    cEmailSubject = f"Centrix Success in {aVariablesVal['DCTVARIABLE_TEMPLATENAME']}"
            
            if oEmailTemplateList[0].get('cEmailBody'):
                email_body = oEmailTemplateList[0]['cEmailBody']
                # exception_found = aVariablesVal.get('DCTVARIABLE_EXCEPTION_FOUND')

                if bExceptionfound == 'Y':
                    eEditedEmailBody = re.sub(r'<!-- SUCCESSSTART -->[\s\S]*?<!-- SUCCESSEND -->', '', email_body)
                elif bExceptionfound == 'N':
                    eEditedEmailBody = re.sub(r'<!-- ERRORSTART -->[\s\S]*?<!-- ERROREND -->', '', email_body)
                else:
                    eEditedEmailBody = email_body
                    
            aEmailVariablesVal = {
                "extra_subject": cEmailSubject,
                "extra_to_emails": ",".join(sendToEmailArray),
                "extra_cc_emails": ",".join(ccEmailArray),
                "eEditedEmailBody": eEditedEmailBody
            }

            if oEmailTemplateList and len(oEmailTemplateList) > 0:
                oEmailTemplateDetailList = oEmailTemplateList[0]
                self.FunDCT_SendSMTPNotification(
                    "MEMBER_UPLOAD",
                    oEmailTemplateDetailList,
                    aEmailVariablesVal,
                    aVariablesVal,
                    sendToEmailArray
                )

        except Exception as e:
            LogService.log('Error : FunDCT_SendAdminMemberUploadDetails Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendAdminMemberUploadDetails Error while parsing file due to ' + str(e))


    def FunDCT_SendConsolidateFile(self, cTemplateStatusFile, oTemplateDetails, oParams):
        try:
            oEmailTemplateList = []

            if oTemplateDetails[0]["oTemplateMetaDataListing"].get("cEmailFrom", "").strip():
                oEmailTemplateList = list(self.oPyDB.gen_emailtemplates.aggregate([
                    {
                        "$match": {
                            "cFrom": oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailFrom"].strip()
                        }
                    },
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    {"$unwind": "$oProcessListing"},
                    {"$unwind": "$oProcessListing.cProcessCode"},
                    {
                        "$match": {
                            "oProcessListing.cProcessCode": "CONSOLIDATE_TEMPLATE"
                        }
                    }
                ]))

            CONSOLIDATEFILE = f"{FRONTEND_URI}sessions/s3download?downloadpath={cTemplateStatusFile}"
            sendToEmailArray = []
            cUsername = oParams["oRequestedByUserDetails"].get("cUsername", "")
            cEmail = oParams["oRequestedByUserDetails"].get("cEmail", "")
            sendToEmailArray.append(cEmail)  # Add user's email to cTo array
            aVariablesVal = {
                "DCTVARIABLE_USERNAME": cUsername,
                "DCTVARIABLE_FILE": CONSOLIDATEFILE,
                "DCTVARIABLE_TEMPLATENAME": oTemplateDetails[0]["cTemplateName"],
                "DCTVARIABLE_REQUEST_TYPE": oParams["cRequestType"]
            }

            if oEmailTemplateList and len(oEmailTemplateList) > 0:
                oEmailTemplateDetailList = oEmailTemplateList[0]
                self.FunDCT_SendSMTPNotification(
                    "CONSOLIDATE_TEMPLATE",
                    oEmailTemplateDetailList,
                    oEmailTemplateDetailList["cEmailType"],
                    aVariablesVal,
                    sendToEmailArray
                )

        except Exception as e:
            LogService.log('Error : FunDCT_SendConsolidateFile Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendConsolidateFile Error while parsing file due to ' + str(e))
            
    def FunDCT_SendMemberSubmissionFile(self, cTemplateStatusFile, oTemplateDetails, oParams):
        try:
            oEmailTemplateList = []

            if oTemplateDetails[0]["oTemplateMetaDataListing"].get("cEmailFrom", "").strip():
                oEmailTemplateList = list(self.oPyDB.gen_emailtemplates.aggregate([
                    {
                        "$match": {
                            "cFrom": oTemplateDetails[0]["oTemplateMetaDataListing"]["cEmailFrom"].strip()
                        }
                    },
                    {
                        "$lookup": {
                            "from": "gen_processes",
                            "localField": "iProcessID",
                            "foreignField": "_id",
                            "as": "oProcessListing"
                        }
                    },
                    {"$unwind": "$oProcessListing"},
                    {"$unwind": "$oProcessListing.cProcessCode"},
                    {
                        "$match": {
                            "oProcessListing.cProcessCode": "MEMBER_SUBMISSION_TEMPLATE"
                        }
                    }
                ]))


            CONSOLIDATEFILE = f"{FRONTEND_URI}sessions/s3download?downloadpath={cTemplateStatusFile}"
            sendToEmailArray = []
            cUsername = oParams["oRequestedByUserDetails"].get("cUsername", "")
            cEmail = oParams["oRequestedByUserDetails"].get("cEmail", "")
            sendToEmailArray.append(cEmail)  # Add user's email to cTo array
            aVariablesVal = {
                "DCTVARIABLE_USERNAME": cUsername,
                "DCTVARIABLE_TEMPLATENAME": oTemplateDetails[0]["cTemplateName"],
                "DCTVARIABLE_FILE": CONSOLIDATEFILE,
            }

            if oEmailTemplateList and len(oEmailTemplateList) > 0:
                oEmailTemplateDetailList = oEmailTemplateList[0]
                self.FunDCT_SendSMTPNotification(
                    "CONSOLIDATE_TEMPLATE",
                    oEmailTemplateDetailList,
                    oEmailTemplateDetailList["cEmailType"],
                    aVariablesVal,
                    sendToEmailArray
                )

        except Exception as e:
            LogService.log('Error : FunDCT_SendMemberSubmissionFile Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_SendMemberSubmissionFile Error while parsing file due to ' + str(e))
        

    def FunDCT_GetTemplateUploadLog(self, iTemplateUploadLogID):
        try:
            oGetTemplateUploadLog = self.oPyDB.tmpl_uploadlogs.find(
                {'_id': ObjectId(iTemplateUploadLogID)})
            return list(oGetTemplateUploadLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetTemplateUploadLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetTemplateUploadLog Error while parsing file due to ' + str(e))
        

    def FunDCT_UpdateTemplateUploadLog(self, oTmplUploadLogId, uData):
        try:
            oGetTemplateUploadLog = self.oPyDB.tmpl_uploadlogs.update_one(
                {"_id": ObjectId(oTmplUploadLogId)},
                {
                    "$set": uData
                }
            )
            return list(oGetTemplateUploadLog)
        except Exception as e:
            LogService.log('Error : FunDCT_GetTemplateUploadLog Error while parsing file due to ' + str(e))
            return ConfigurationMessageHandling.FunDCT_ConfigurationMessageHandling('Error', 'FunDCT_GetTemplateUploadLog Error while parsing file due to ' + str(e))
        

    def FunDCT_updateMetadataByTemplateID(self,iTemplateID,uData):
        try:
            oTemplateMetaDetails = list(self.oPyDB.tmpl_metadatas.update_one(
                {"iTemplateID": iTemplateID},
                {"$set": uData}
            ))
            return oTemplateMetaDetails
        except Exception as err:
            LogService.log('Error : FunDCT_updateMetadataByTemplateID ' + str(err))
            return None
        

    def FunDCT_GetAllActiveUsres(self):
        try:
            pipeline = [
                        {
                            "$lookup": {
                                "from": "gen_statuses",
                                "let": {"statusId": "$iStatusID"},
                                "pipeline": [
                                    {
                                        "$match": {
                                            "$expr": {
                                                "$and": [
                                                    {"$eq": ["$_id", "$$statusId"]},
                                                    {"$eq": ["$cStatusCode", "ACTIVE"]}
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "as": "oStatusListing"
                            }
                        },
                        {
                            "$unwind": "$oStatusListing"
                        },
                        {
                            "$project": {
                                "cEmail": 1,
                                "lastPasswordReset": 1
                            }
                        }
                    ]
            activeUsers = list(self.oPyDB.gen_users.aggregate(pipeline))
            return activeUsers
        except Exception as err:
            LogService.log('Error : FunDCT_updateMetadataByTemplateID ' + str(err))
            return None

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
from pandas.core.indexes.base import Index

# from pyconfig.LogService import LogService
oNow = datetime.now()
import re
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(0, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)

from pyconfig.model_common import model_common_Cls
class MessageHandling:
    msgDict:dict
    model_common:model_common_Cls
    def __init__(self) -> None:
        self.model_common = model_common_Cls()
        msges = self.model_common.FunDCT_GetValidationMessage()
        self.msgDict = {}
        for i, d in enumerate(msges):
            self.msgDict[d['cMessageCode']] = d['cDescription']


    def FunDCT_GetValidationDescription(self,cModuleCode, cMessageCode):
        try:
            bValidate = 'WWA-CENTRIX: Internal Server Error.'
            # oValidMessage = model_common.FunDCT_GetValidationMessage(cModuleCode, cMessageCode)
            # if len(oValidMessage) > 0:
            #     oTeV = oValidMessage[0]
            bValidate = self.msgDict.get(cMessageCode)

            # for i, d in enumerate(oValidMessage):
            #     if d['cMessageCode'] == cMessageCode:
            #         bValidate = d['cDescription']
        except Exception as e:
            # LogService.log("FunDCT_GetValidationDescription"+str(e))
            return "FunDCT_GetValidationDescription"+str(e)

        return bValidate

    def FunDCT_MessageHandling(self,cStatus, oResponse):
        try:
            if (cStatus == 'Success'):
                cResponse = json.dumps({'cStatus': cStatus, 'oResponse': oResponse})
                return cResponse
            elif (cStatus == 'ErrorValidation'):
                cResponse = json.dumps({'cStatus': cStatus, 'oResponse': oResponse})
                return cResponse
            else:
                pass
            return
                # LogService.log('Skeeping--------Error ')
        except Exception as e:
            return "FunDCT_MessageHandling "+str(e)
        
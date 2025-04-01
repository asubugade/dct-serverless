import sys
import json
import os

def FunDCT_ConfigurationMessageHandling(cStatus, oResponse):
    try:
        cResponse = json.dumps({'cStatus': cStatus, 'oResponse': oResponse})
        return cResponse
        # print(cResponse)
    except Exception as e:
        return "FunDCT_ConfigurationMessageHandling"+str(e)
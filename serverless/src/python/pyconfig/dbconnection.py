from pymongo import MongoClient
from pyconfig import loadConfig
from pyconfig.LogService import LogService
class Database:
    oPyDB:any
    def __init__(self) -> None:
        self.connect()
    def connect(self):
        try:

            if loadConfig.NODE_ENV == 'Server':
                connectionURL  =f'mongodb://{loadConfig.cUserNameDB}:{loadConfig.cPasswordDB}@{loadConfig.cHost}/{loadConfig.cDBName}'
            else:
                connectionURL  =f'mongodb://{loadConfig.cHost}/'
            LogService.log(f'Connection URL ==> {connectionURL}')
            oPyConnectDB = MongoClient(connectionURL)
            LogService.log(f'DB connection ==> {oPyConnectDB}')
            oPyDB = oPyConnectDB
            LogService.log(f'Selecting db {loadConfig.cDBName}')
            dblist = oPyDB.get_database(loadConfig.cDBName)
            self.oPyDB = dblist
        except Exception as err:
            LogService.log(f'DB Connection Error : {err}')
    
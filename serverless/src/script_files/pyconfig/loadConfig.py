import os
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
import sys
import inspect
from pyconfig.YamlConfigLoader import YamlConfigLoader

path = str(Path(Path(__file__).parent.absolute()).parent.parent.parent.absolute())+ '\config.yml'
yaml = YamlConfigLoader(path)
sys.path.insert(2, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)
from pyconfig.secreteManager import secreteManager
# load_dotenv(find_dotenv())
scm = secreteManager()
HOME_DIR = yaml.getStr("environment","HOME_DIR")
NODE_ENV = yaml.getStr("environment","NODE_ENV")

CORS_URL = yaml.getStr("environment","CORS_URL")

# for stating
cUserNameDB =scm.get("cUserNameDB")
cPasswordDB =scm.get("cPasswordDB")
cHost = scm.get("cHost")
cDBName = scm.get("cDBName")
PORT = scm.get("PORT")

# For SMTP emails
SMTP_USER = scm.get("NOTIFICATION_EMAIL")
SMTP_PASS = scm.get("NOTIFICATION_EMAIL_PWD")
SMTP_SERVICE = scm.get("NOTIFICATION_EMAIL_SERVICE")
SMTP_HOST = scm.get("NOTIFICATION_EMAIL_HOST")
SMTP_PORT = scm.get("NOTIFICATION_EMAIL_PY_PORT")
SMTP_RETRIES = scm.get("NOTIFICATION_EMAIL_RETRIVE")

FRONTEND_URI_LOCAL = scm.get("FRONTEND_URI_LOCAL")

# ACCESS_TOKEN_VALIDITY_DAYS = yaml.getStr("environment","ACCESS_TOKEN_VALIDITY_DAYS")
# REFRESH_TOKEN_VALIDITY_DAYS = yaml.getStr("environment","REFRESH_TOKEN_VALIDITY_DAYS")
# TOKEN_ISSUER = yaml.getStr("environment","TOKEN_ISSUER")
# TOKEN_AUDIENCE = yaml.getStr("environment","TOKEN_AUDIENCE")

# cJwtExpiration = yaml.getStr("environment","cJwtExpiration")
# cJwtSecret = yaml.getStr("environment","cJwtSecret")
# cCryptoKey = yaml.getStr("environment","cCryptoKey")

AWS_ACCESS_KEY = scm.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = scm.get("AWS_SECRET_KEY")
AWS_BUCKET = scm.get("AWS_BUCKET")
AWS_REGION = scm.get("AWS_REGION")
AWS_BUCKET_ENV = scm.get("AWS_BUCKET")
AWS_BUCKET_TEMPLATES = yaml.getStr("environment","AWS_BUCKET_TEMPLATES")
AWS_BUCKET_TEMPLATES_IMPORTHEADER = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_IMPORTHEADER")
AWS_BUCKET_TEMPLATES_SAMPLEFILE = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_SAMPLEFILE")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE")
AWS_BUCKET_TEMPLATES_DISTRIBUTION = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_DISTRIBUTION")
AWS_BUCKET_TEMPLATES_CONSOLIDATION = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_CONSOLIDATION")

AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_INTERTEAM = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_INTERTEAM")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_MEMBER = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_MEMBER")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_STATUSFILE = yaml.getStr("environment","AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_STATUSFILE")

AWS_BUCKET_EXPORT_LISTING = yaml.getStr("environment","AWS_BUCKET_EXPORT_LISTING")
AWS_BUCKET_PROFILE_IMAGE = yaml.getStr("environment","AWS_BUCKET_PROFILE_IMAGE")

PY_VALIDATION_SEPARATOR = yaml.getStr("environment","PY_VALIDATION_SEPARATOR")
PY_RANGE_VALUE_SEPARATOR = yaml.getStr("environment","PY_RANGE_VALUE_SEPARATOR")
PY_BRACKET_VALIDATION_SEPARATOR = yaml.getStr("environment","PY_BRACKET_VALIDATION_SEPARATOR")
EXL_PASS = yaml.getStr("environment",'EXL_PASS')
NODE_ENV= yaml.getStr("environment",'NODE_ENV')
CLOUDWATCH_GROUP = scm.get('CLOUDWATCH_GROUP')
CLOUDWATCH_ACCESS_KEY = scm.get('CLOUDWATCH_ACCESS_KEY')
CLOUDWATCH_SECRET_ACCESS_KEY = scm.get('CLOUDWATCH_SECRET_ACCESS_KEY')
CLOUDWATCH_REGION = scm.get('CLOUDWATCH_REGION')
PRINT = True
LOG_MEMORY = True
SECRET_NAME = yaml.getStr("environment",'SECRET_NAME')
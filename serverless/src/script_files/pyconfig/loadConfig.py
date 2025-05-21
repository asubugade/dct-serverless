import os
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
import sys
import inspect

path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(2, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)
from pyconfig.secreteManager import secreteManager
load_dotenv(find_dotenv())
scm = secreteManager()

NODE_ENV = os.environ.get("NODE_ENV")

CORS_URL = os.environ.get("CORS_URL")

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

# ACCESS_TOKEN_VALIDITY_DAYS = os.environ.get("ACCESS_TOKEN_VALIDITY_DAYS")
# REFRESH_TOKEN_VALIDITY_DAYS = os.environ.get("REFRESH_TOKEN_VALIDITY_DAYS")
# TOKEN_ISSUER = os.environ.get("TOKEN_ISSUER")
# TOKEN_AUDIENCE = os.environ.get("TOKEN_AUDIENCE")

# cJwtExpiration = os.environ.get("cJwtExpiration")
# cJwtSecret = os.environ.get("cJwtSecret")
# cCryptoKey = os.environ.get("cCryptoKey")

AWS_ACCESS_KEY = scm.get("AWS_ACCESS_KEY")
AWS_SECRET_KEY = scm.get("AWS_SECRET_KEY")
AWS_BUCKET = scm.get("AWS_BUCKET")
AWS_REGION = scm.get("AWS_REGION")
AWS_BUCKET_ENV = scm.get("AWS_BUCKET")
AWS_BUCKET_TEMPLATES = os.environ.get("AWS_BUCKET_TEMPLATES")
AWS_BUCKET_TEMPLATES_IMPORTHEADER = os.environ.get("AWS_BUCKET_TEMPLATES_IMPORTHEADER")
AWS_BUCKET_TEMPLATES_SAMPLEFILE = os.environ.get("AWS_BUCKET_TEMPLATES_SAMPLEFILE")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE = os.environ.get("AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE")
AWS_BUCKET_TEMPLATES_DISTRIBUTION = os.environ.get("AWS_BUCKET_TEMPLATES_DISTRIBUTION")
AWS_BUCKET_TEMPLATES_CONSOLIDATION = os.environ.get("AWS_BUCKET_TEMPLATES_CONSOLIDATION")

AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_INTERTEAM = os.environ.get("AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_INTERTEAM")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_MEMBER = os.environ.get("AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_MEMBER")
AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_STATUSFILE = os.environ.get("AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE_STATUSFILE")

AWS_BUCKET_EXPORT_LISTING = os.environ.get("AWS_BUCKET_EXPORT_LISTING")
AWS_BUCKET_PROFILE_IMAGE = os.environ.get("AWS_BUCKET_PROFILE_IMAGE")

PY_VALIDATION_SEPARATOR = os.environ.get("PY_VALIDATION_SEPARATOR")
PY_RANGE_VALUE_SEPARATOR = os.environ.get("PY_RANGE_VALUE_SEPARATOR")
PY_BRACKET_VALIDATION_SEPARATOR = os.environ.get("PY_BRACKET_VALIDATION_SEPARATOR")
EXL_PASS = os.environ.get('EXL_PASS')
NODE_ENV= os.environ.get('NODE_ENV')
CLOUDWATCH_GROUP = scm.get('CLOUDWATCH_GROUP')
CLOUDWATCH_ACCESS_KEY = scm.get('CLOUDWATCH_ACCESS_KEY')
CLOUDWATCH_SECRET_ACCESS_KEY = scm.get('CLOUDWATCH_SECRET_ACCESS_KEY')
CLOUDWATCH_REGION = scm.get('CLOUDWATCH_REGION')
PRINT = True
LOG_MEMORY = True
SECRET_NAME = os.environ.get('SECRET_NAME')
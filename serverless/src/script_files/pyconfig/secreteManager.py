import sys,os
import boto3
from botocore.exceptions import ClientError
import json
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
import inspect

path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(2, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)

load_dotenv(find_dotenv())
class secreteManager:
    secrets :dict
    def __init__(self) -> None:
        pass
    def connect(self)-> None:
        session = boto3.session.Session()
        client = session.client(
        service_name='secretsmanager',
        region_name=os.environ.get('AWS_REGION'),
    )
        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=os.environ.get('SECRET_NAME')
            )
            self.secrets = get_secret_value_response
        except ClientError as e:
            print(e)
            # with open(os.environ.get('HOME_DIR')+'secreateManager.txt', 'w') as f:
            #     if e.response['Error']['Code'] == 'ResourceNotFoundException':
            #         f.write("The requested secret " + os.environ.get('SECRET_NAME') + " was not found")
            #     elif e.response['Error']['Code'] == 'InvalidRequestException':
            #         f.write("The request was invalid due to:", e)
            #     elif e.response['Error']['Code'] == 'InvalidParameterException':
            #         f.write("The request had invalid params:", e)
            #     elif e.response['Error']['Code'] == 'DecryptionFailure':
            #         f.write("The requested secret can't be decrypted using the provided KMS key:", e)
            #     elif e.response['Error']['Code'] == 'InternalServiceError':
            #         f.write("An error occurred on service side:", e)

    def get(self,val):
        if os.environ.get('NODE_ENV') == 'Local':
            return os.environ.get(val)
        else:
            self.connect()
            self.secrets =  json.loads(self.secrets.get('SecretString'))
            return self.secrets.get(val)

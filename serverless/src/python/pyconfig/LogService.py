from io import StringIO
import json
import boto3
import sys
import os
from pyconfig.MemoryService import MemoryService
import watchtower, logging
from datetime import datetime
from pyconfig import loadConfig
import traceback
import warnings

class NullIO(StringIO):
	def write(self, txt):
	   pass
logstream:str
class LogService:

	logger = None

	deep_join = lambda L: ' '.join([LogService.deep_join(x) if type(x) is list else x for x in L]) # type: ignore

	WatchtowerInited = False

	@staticmethod
	def _init():
		warnings.simplefilter(action='ignore',category=UserWarning)
		logstream = ''

	@staticmethod
	def direct_cloudwatch(text:str):
		if loadConfig.NODE_ENV == 'Server':


			if LogService.WatchtowerInited == False:

				logging.basicConfig(level=logging.INFO)

				# this gets the root logger
				LogService.logger = logging.getLogger()

				# get stdoutput logger
				stdoutLogger = LogService.logger.handlers[0]

				date = datetime.today().strftime('%Y/%m/%d')

				# get cloudwatch logger
				boto_client = boto3.client('logs',
					region_name=loadConfig.CLOUDWATCH_REGION,
					aws_access_key_id=loadConfig.CLOUDWATCH_ACCESS_KEY,
					aws_secret_access_key=loadConfig.CLOUDWATCH_SECRET_ACCESS_KEY)
				STSTEMARG = json.loads(sys.argv[1])
				cUserID,cType = '0001', 'Unknown'
				try:
					if STSTEMARG:
						if STSTEMARG['cUserID']:
							cUserID = STSTEMARG['cUserID']
						if STSTEMARG['cType']:
							cType = STSTEMARG['cType']
				except:
					pass
				stream_name = date + '/'+ cUserID +  cType 

				# create cloudwatch logger
				LogService.logger.addHandler(watchtower.CloudWatchLogHandler(
					log_group_name=loadConfig.CLOUDWATCH_GROUP,
					log_stream_name=stream_name,
					boto3_client=boto_client))

				# disable stdoutput logger
				LogService.logger.removeHandler(stdoutLogger)

				# disable stdout from print()
				# sys.stdout = NullIO()

				LogService.WatchtowerInited = True

			
			LogService.logger.info(text)


	@staticmethod
	def print(*args):
		if loadConfig.PRINT:
			if len(args) == 1 and isinstance(args[0], str):
				print("Print: " + args[0])
			else:
				try:
					print("Print: " + LogService.deep_join(args))
				except:
					print(args)


	@staticmethod
	def log(text:str):

		# for EC2 pods
		if loadConfig.NODE_ENV == 'Server':
			if loadConfig.LOG_MEMORY:
				LogService.direct_cloudwatch(MemoryService.getMemoryUsedStr() + " - " + str(text))
			else:
				LogService.direct_cloudwatch(str(text))
		# else:

		# 	# for Lambdas or EKS
		# 	if loadConfig.LOG_MEMORY:
		# 		print("Info:  " + MemoryService.getMemoryUsedStr() + " - " + str(text))
		# 	else:
		# 		print("Info:  " + str(text))


	@staticmethod
	def error(text:str, exception = None):

		# Generate a stack trace at this point
		# which also includes information about the caller
		exc_type, exc_obj, exc_tb = sys.exc_info()
		final_error = ''
		if exc_tb is None:
			final_error = (f"Global scope error: {text}")

		# If no exception is given, just trace the text and stack
		elif exception is None:
			fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
			final_error = (f"{text}, Filename: {fname}, Line: {exc_tb.tb_lineno}")

		# If exception is given, trace the exception info as well
		else:
			exc_type, exc_obj, exc_tb = sys.exc_info()
			fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1] # type: ignore
			final_error = (f"{text}, Filename: {fname}, Line: {exc_tb.tb_lineno}, Exception: {exc_type}, {str(exception)}") # type: ignore
		# add call stack
		final_error += LogService.get_exception_stack()
		
		# for EC2 pods
		if loadConfig.NODE_ENV == 'Server':
			LogService.direct_cloudwatch(final_error)
		# else:

			# for Lambdas
			# print("Error: " + final_error)

	@staticmethod
	def get_exception_stack():
		try:
			exc = sys.exc_info()[0]
			stack = traceback.extract_stack()[:-1]  # last one would be full_stack()

			# if an exception is present
			if exc is not None:
				del stack[-1]		# remove call of full_stack, the printed exception
									# will contain the caught exception caller instead

			prefix = '\n\n'
			trc = 'Traceback (most recent call last):\n'
			stackstr = prefix + ''.join(traceback.format_list(stack))

			# if an exception is present
			if exc is not None:
				stackstr += '  ' + traceback.format_exc().lstrip(trc)

			return stackstr
		except:
			pass
		return ''

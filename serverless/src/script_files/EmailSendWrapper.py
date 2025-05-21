import os,sys
from pathlib import Path
path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(0, path)
file_dir = os.path.dirname(__file__)

from EmailService import EmailService
from script_files.EmailSmtpClient import EmailSMTPClient

import smtplib
import mimetypes
from email.message import EmailMessage
from typing import List, Optional

# Initialize SMTP client
smtp_client = EmailSMTPClient()

# Sample Data
test_source_email = "jivan.shipco@gmail.com"
test_to_emails = ["jraisoni@shipco.com"]
test_cc_emails = ["abc@gmail.com"]
test_bcc_emails = ["test@gmail.com"]
test_subject = "Test Email SMTP Python"
test_body = "<h1>Hello, this is a test email!</h1>"

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

# class EmailSendWrapper:
#     @staticmethod

#     def sendTemplatedEmail():
#         return

# class SMTPEmailWrapper:
#     def __init__(self, smtp_server: str, smtp_port: int, username: str, password: str, use_tls: bool = True):
#         self.smtp_server = smtp_server
#         self.smtp_port = smtp_port
#         self.username = username
#         self.password = password
#         self.use_tls = use_tls

#     def send_email(
#         self,
#         sender: str,
#         recipients: List[str],
#         subject: str,
#         body: str,
#         body_html: Optional[str] = None,
#         cc: Optional[List[str]] = None,
#         bcc: Optional[List[str]] = None,
#         attachments: Optional[List[str]] = None
#     ) -> bool:
#         """
#         Sends an email with the given parameters.
#         :param sender: The email sender address.
#         :param recipients: List of recipient email addresses.
#         :param subject: Email subject.
#         :param body: Plain text email body.
#         :param body_html: HTML version of the email body (optional).
#         :param cc: List of CC email addresses (optional).
#         :param bcc: List of BCC email addresses (optional).
#         :param attachments: List of file paths to attach (optional).
#         :return: True if the email was sent successfully, False otherwise.
#         """
#         try:
#             msg = EmailMessage()
#             msg['From'] = sender
#             msg['To'] = ', '.join(recipients)
#             msg['Subject'] = subject

#             if cc:
#                 msg['Cc'] = ', '.join(cc)
#             if bcc:
#                 recipients += bcc  # BCC recipients are added here but not in the header

#             # Set email content
#             if body_html:
#                 msg.set_content(body)
#                 msg.add_alternative(body_html, subtype='html')
#             else:
#                 msg.set_content(body)

#             # Attach files if any
#             if attachments:
#                 for file_path in attachments:
#                     if os.path.exists(file_path):
#                         ctype, encoding = mimetypes.guess_type(file_path)
#                         if ctype is None or encoding is not None:
#                             ctype = 'application/octet-stream'
#                         maintype, subtype = ctype.split('/', 1)

#                         with open(file_path, 'rb') as f:
#                             msg.add_attachment(f.read(), maintype=maintype, subtype=subtype, filename=os.path.basename(file_path))
#                     else:
#                         print(f"Warning: Attachment {file_path} not found.")

#             # Connect to SMTP server
#             with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
#                 if self.use_tls:
#                     server.starttls()
#                 server.login(self.username, self.password)
#                 server.sendmail(sender, recipients, msg.as_string())
#                 print("Email sent successfully.")
#                 return True

#         except Exception as e:
#             print(f"Failed to send email: {e}")
#             return False
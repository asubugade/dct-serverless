import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from EmailBaseClient import EmailBaseClient
from pyconfig import loadConfig
from pyconfig.LogService import LogService


class EmailSMTPClient(EmailBaseClient):
    smtp_client = None
    STARTTLS = True

    def __init__(self, STARTTLS=True):
        EmailSMTPClient.STARTTLS = STARTTLS

    def exists(self, value):
        return isinstance(value, str) and bool(value.strip())

    def smtp_get_client(self):
        """
        Returns an SMTP client by creating a client on the first call 
        and reusing the same client for subsequent calls.
        """
        tries = loadConfig.SMTP_RETRIES
        for attempt in range(1, int(tries) + 1):
            if EmailSMTPClient.smtp_client is None:
                try:
                    email_port = int(loadConfig.SMTP_PORT)
                    EmailSMTPClient.smtp_client = smtplib.SMTP(loadConfig.SMTP_HOST, email_port)
                    
                    if EmailSMTPClient.STARTTLS:
                        EmailSMTPClient.smtp_client.starttls()

                    if self.exists(loadConfig.SMTP_USER) and self.exists(loadConfig.SMTP_PASS):
                        EmailSMTPClient.smtp_client.login(loadConfig.SMTP_USER, loadConfig.SMTP_PASS)

                    LogService.log("Email: Successfully created SMTP client")
                    return EmailSMTPClient.smtp_client

                except smtplib.SMTPAuthenticationError:
                    LogService.log("Email: Authentication failed. Incorrect SMTP credentials.")
                    EmailSMTPClient.smtp_client = None
                    return None  # Stop retrying on authentication failure

                except Exception as e:
                    LogService.error(f"Email: Attempt {attempt}/{tries} failed to establish SMTP connection.", e)
                    EmailSMTPClient.smtp_client = None
            else:
                return EmailSMTPClient.smtp_client

        LogService.log(f"Exhausted all {tries} attempts to connect to SMTP.")
        return None

    def send(self, sourceEmail: str, toEmails: list, ccEmails: list, bccEmails: list, subject: str, body: str):
        """
        Sends an HTML email using an SMTP client.
        """
        try:
            client = self.smtp_get_client()
            if client is None:
                raise Exception("Failure in creation of SMTP client")

            # Validate SMTP connection
            try:
                validate_connection = client.noop()
                if validate_connection[0] != 250:
                    raise smtplib.SMTPServerDisconnected("SMTP connection to server is no longer valid.")
            except smtplib.SMTPServerDisconnected:
                EmailSMTPClient.smtp_client = None
                client = self.smtp_get_client()

            # Ensure email lists are valid
            toEmails = toEmails if isinstance(toEmails, list) else []
            ccEmails = ccEmails if isinstance(ccEmails, list) else []
            bccEmails = bccEmails if isinstance(bccEmails, list) else []

            # Create email message
            msg = MIMEMultipart()
            msg["From"] = sourceEmail
            msg["To"] = ", ".join(toEmails)
            msg["Cc"] = ", ".join(ccEmails)
            msg["Bcc"] = ", ".join(bccEmails)
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "html"))

            # Collect all recipients
            recipients = set(toEmails + ccEmails + bccEmails)

            if not recipients:
                LogService.log("Email: No recipients specified. Skipping email send.")
                return False

            # Send email
            client.sendmail(sourceEmail, list(recipients), msg.as_string())
            LogService.log(f"Email: Successfully sent email '{subject}' to {recipients}")
            return True

        except Exception as e:
            LogService.error("Email: SMTP failed to send email.", e)
            return False

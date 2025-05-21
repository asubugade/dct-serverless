from script_files.EmailBaseClient import EmailBaseClient
from pyconfig import loadConfig
from pyconfig.LogService import LogService


class EmailService:
    @staticmethod
    def sendTemplatedEmail(
        templateAsHTML: str,
        trigger: str,
        title: str,
        user_email: str,
        metadata: dict,
        client: EmailBaseClient,
        toEmails: list,
        ccEmails: list,
        bccEmails: list,
        notification_email: str = None,
    ):
        """
        Send an HTML email using the provided email client.
        """
        LogService.log(f"Email: Preparing to send email for trigger: {title} ({trigger})")

        subject = title
        body = templateAsHTML

        # Add notification email to recipients
        if notification_email and notification_email not in toEmails:
            toEmails.append(notification_email)

        if user_email:
            if client.send(user_email, toEmails, ccEmails, bccEmails, subject, body):
                LogService.log(f"Email: Sent email '{subject}' to {toEmails}")

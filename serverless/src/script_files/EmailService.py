from EmailBaseClient import EmailBaseClient
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
        try:
            LogService.log(f"Email: Preparing to send email for trigger: {title} ({trigger})")

            subject = title
            body = templateAsHTML

            # Add notification email to recipients
            if notification_email and notification_email not in toEmails:
                toEmails.append(notification_email)

            if user_email:
                    try:
                        success = client.send(user_email, toEmails, ccEmails, bccEmails, subject, body)
                        if success:
                            print(f"Email: Successfully sent email '{subject}' to {toEmails}")
                            LogService.log(f"Email: Sent email '{subject}' to {toEmails}")
                        else:
                            print(f"Email: Failed to send email '{subject}' to {toEmails}")
                            LogService.log(f"Email: Failed to send email '{subject}' to {toEmails}")
                    except Exception as e:
                        print(f"Email: Exception occurred while sending email for trigger '{trigger}': {str(e)}")
                        LogService.log(f"Email: Exception occurred while sending email for trigger '{trigger}': {str(e)}")

        except Exception as e:
            LogService.log(f"Email: Exception occurred while sending email for trigger '{trigger}': {str(e)}")

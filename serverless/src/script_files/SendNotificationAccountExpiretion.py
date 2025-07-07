# import pymongo
from datetime import datetime, timedelta
# import smtplib
# from email.mime.text import MIMEText
from pyconfig.model_common import model_common_Cls
from EmailService import EmailService
from EmailSmtpClient import EmailSMTPClient

smtp_client = EmailSMTPClient()
model_common = model_common_Cls()

def check_and_send_password_expiry_emails():
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    

    users = model_common.FunDCT_GetAllActiveUsres()

    for user in users:
        last_reset = user.get('lastPasswordReset')
        if not last_reset:
            continue

        expiry_date = last_reset + timedelta(days=90)
        days_left = (expiry_date - today).days

        if days_left in [89,7, 3, 0]:
            if days_left == 89:
                subject = 'Password Expiry Reminder: 7 Days Left'
                message = 'Your password will expire in 7 days. Please reset it to maintain access.'
            if days_left == 7:
                subject = 'Password Expiry Reminder: 7 Days Left'
                message = 'Your password will expire in 7 days. Please reset it to maintain access.'
            elif days_left == 3:
                subject = 'Password Expiry Reminder: 3 Days Left'
                message = 'Your password will expire in 3 days. Reset it soon to avoid interruption.'
            else:  # days_left == 0
                subject = 'Password Expired Today'
                message = 'Your password expires today. Please reset it immediately.'

            # Prepare email parameters
            templateAsHTML = f"<html><body><p>{message}</p></body></html>"
            trigger = "PasswordExpiryNotification"
            title = subject
            user_email = "aditysubugade05@gmail.com"  # This is usually the sender email

            toEmails = [user.get('cEmail')] if user.get('cEmail') else []
            # toEmails =['jraisoni@shipco.com']
            ccEmails = []
            bccEmails = []
            metadata = {}

            # Example: smtp_client is assumed to be created somewhere globally
            EmailService.sendTemplatedEmail(
                templateAsHTML,        # templateAsHTML (HTML email body)
                trigger,               # trigger (string identifier)
                title,                 # title (email subject)
                user_email,            # user_email (from)
                metadata,              # metadata (optional additional data)
                smtp_client,           # client (email client instance)
                toEmails,              # toEmails (list)
                ccEmails,              # ccEmails (list)
                bccEmails,             # bccEmails (list)
                None                   # notification_email (optional)
            )
            print(f"Sending email to {user.get('cEmail')} - Days left: {days_left} - Subject: {subject}")

# def send_email(to_email, subject, body):
#     from_email = "no-reply@yourdomain.com"
#     msg = MIMEText(body)
#     msg['Subject'] = subject
#     msg['From'] = f'System Admin <{from_email}>'
#     msg['To'] = to_email

#     try:
#         # Example using Gmail SMTP (you may need to adjust for your provider)
#         with smtplib.SMTP('smtp.gmail.com', 587) as server:
#             server.starttls()
#             server.login('your_email@gmail.com', 'your_password')  # Replace with valid credentials
#             server.sendmail(from_email, [to_email], msg.as_string())
#     except Exception as e:
#         print(f"Failed to send email to {to_email}: {e}")

# Call the function
check_and_send_password_expiry_emails()

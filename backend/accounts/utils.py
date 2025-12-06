from django.core.mail import EmailMessage
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

def send_verification_email(user):
    """
    Send email verification link to user.
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    verification_link = f"http://localhost:5173/verify-email/{uid}/{token}/"

    mail_subject = "Verify your Investo account"
    message = f"""
Hi {user.username},

Please click the link below to verify your Investo account:

{verification_link}

If you did not create this account, ignore this email.
"""

    email = EmailMessage(mail_subject, message, settings.EMAIL_HOST_USER, [user.email])
    email.send()

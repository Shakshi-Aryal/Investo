from django.core.mail import EmailMessage
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
import threading


def _async_send(email):
    """Send email in a separate thread so it doesn't slow API."""
    try:
        email.send()
    except Exception as e:
        print("Email sending error:", e)


def send_verification_email(user):
    """
    Sends email verification link to user's email (FAST, non-blocking)
    """
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    verification_link = f"http://localhost:5173/verify-email/{uid}/{token}/"

    mail_subject = "Verify your Investo account"
    message = f"""
    Hi {user.username},

    Please click the link below to verify your email:

    {verification_link}

    If you did not create this account, ignore this email.
    """

    email = EmailMessage(
        subject=mail_subject,
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email]
    )

    # 🔥 Send asynchronously to avoid 3–5 sec delay
    threading.Thread(target=_async_send, args=(email,)).start()

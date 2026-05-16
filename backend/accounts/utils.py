import logging
import threading

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMessage
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


def _frontend_base():
    return getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')


def _async_send(email):
    """Send email in a separate thread so it doesn't slow API."""
    try:
        email.send()
    except Exception as e:
        logger.warning('Email sending error: %s', e)


def send_verification_email(user):
    """Sends email verification link (non-blocking)."""
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verification_link = f"{_frontend_base()}/verify-email/{uid}/{token}/"

    mail_subject = 'Verify your Investo account'
    message = f"""
    Hi {user.username},

    Please click the link below to verify your email:

    {verification_link}

    If you did not create this account, ignore this email.
    """

    email = EmailMessage(
        subject=mail_subject,
        body=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )

    threading.Thread(target=_async_send, args=(email,), daemon=True).start()

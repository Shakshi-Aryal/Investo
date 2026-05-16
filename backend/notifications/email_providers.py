"""
Transactional email provider stubs for production deployment.
Configure EMAIL_PROVIDER in Django settings: smtp | resend | sendgrid
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def send_transactional_email(*, to_email, subject, plain_body, html_body=None):
    """
    Dispatch email via the configured provider.
    Returns True when handed off successfully, False otherwise.
    """
    provider = getattr(settings, 'EMAIL_PROVIDER', 'smtp').lower()

    if provider == 'resend':
        return _send_via_resend(to_email, subject, plain_body, html_body)
    if provider == 'sendgrid':
        return _send_via_sendgrid(to_email, subject, plain_body, html_body)
    return _send_via_smtp(to_email, subject, plain_body, html_body)


def _send_via_smtp(to_email, subject, plain_body, html_body):
    from django.core.mail import send_mail

    try:
        send_mail(
            subject=subject,
            message=plain_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_body,
            fail_silently=False,
        )
        return True
    except Exception as exc:
        logger.error('[EMAIL:SMTP] %s', exc)
        return False


def _send_via_resend(to_email, subject, plain_body, html_body):
    """
    Resend API — set RESEND_API_KEY and DEFAULT_FROM_EMAIL in environment.
    https://resend.com/docs/api-reference/emails/send-email
    """
    api_key = getattr(settings, 'RESEND_API_KEY', '')
    if not api_key:
        logger.warning('[EMAIL:Resend] RESEND_API_KEY not set; skipping send')
        return False

    try:
        import urllib.request
        import json

        payload = {
            'from': settings.DEFAULT_FROM_EMAIL,
            'to': [to_email],
            'subject': subject,
            'text': plain_body,
        }
        if html_body:
            payload['html'] = html_body

        req = urllib.request.Request(
            'https://api.resend.com/emails',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return 200 <= resp.status < 300
    except Exception as exc:
        logger.error('[EMAIL:Resend] %s', exc)
        return False


def _send_via_sendgrid(to_email, subject, plain_body, html_body):
    """
    SendGrid v3 Mail Send — set SENDGRID_API_KEY and DEFAULT_FROM_EMAIL.
    """
    api_key = getattr(settings, 'SENDGRID_API_KEY', '')
    if not api_key:
        logger.warning('[EMAIL:SendGrid] SENDGRID_API_KEY not set; skipping send')
        return False

    try:
        import urllib.request
        import json

        content = [{'type': 'text/plain', 'value': plain_body}]
        if html_body:
            content.append({'type': 'text/html', 'value': html_body})

        payload = {
            'personalizations': [{'to': [{'email': to_email}]}],
            'from': {'email': settings.DEFAULT_FROM_EMAIL},
            'subject': subject,
            'content': content,
        }

        req = urllib.request.Request(
            'https://api.sendgrid.com/v3/mail/send',
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            return 200 <= resp.status < 300
    except Exception as exc:
        logger.error('[EMAIL:SendGrid] %s', exc)
        return False
